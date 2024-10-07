import React, { useState, useEffect } from 'react'
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FloatLabel } from "primereact/floatlabel";
import { Checkbox } from 'primereact/checkbox';
import UserAddress from './UserAddress';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';

function MyAccount() {
    const apiCoopUrl = import.meta.env.VITE_REACT_APP_API_COOP;
    const apiUrl = import.meta.env.VITE_REACT_APP_API_PLATFORM;
    const [user, setUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editPasswordMode, setEditPasswordMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone_prefix: '', phone: '', region: '' });
    const [formPassword, setFormPassword] = useState({ old_password: '', new_password: '' });

    const validateForm = () => {
        const { phone } = formData;

        if (!/^\d{10}$/.test(phone)) {
            return "เบอร์โทรศัพท์ต้องเป็นตัวเลข";
        }

        return null;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await axios.get(`${apiCoopUrl}/me`, {
                    headers: { "auth-token": `bearer ${token}` }
                });
                setUser(res.data.data);
                setFormData({
                    name: res.data.data.name,
                    phone_prefix: res.data.data.phone_prefix,
                    phone: res.data.data.phone,
                    region: res.data.data.region
                });
            } catch (err) {
                console.error("Error fetching user data", err.response?.data || err.message);
            }
        };
        fetchUserData();
    }, [apiCoopUrl]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleCancelEdit = () => {
        if (user) {
            setFormData({
                name: user.name,
                phone_prefix: user.phone_prefix,
                phone: user.phone,
                region: user.region
            });
        }
        setEditMode(false);
    };

    const handleUpdateProfile = async () => {
        const validationError = validateForm();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");
        try {
            const res = await axios.put(`${apiCoopUrl}/users/${user_id}`, formData, {
                headers: { "auth-token": `bearer ${token}` }
            });
            setUser(res.data.data);
            setEditMode(false);
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred. Please try again.");
            console.error("Error updating user data", error.response?.data || err.message);
        }
    };

    const handleInputPasswordChange = (e) => {
        const { id, value } = e.target;
        setFormPassword((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleEditPasswordToggle = () => {
        setEditPasswordMode(!editPasswordMode);
    };

    const handleCancelPasswordEdit = () => {
        if (user) {
            setFormPassword((prevData) => ({
                ...prevData,
                old_password: formPassword.old_password,
                new_password: formPassword.new_password
            }));
        }
        setEditPasswordMode(false);
    };

    const handleUpdatePassword = async () => {
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");
        try {
            const res = await axios.put(`${apiCoopUrl}/users/${user_id}/update-password`, formPassword, {
                headers: { "auth-token": `bearer ${token}` }
            });
            setEditPasswordMode(false);
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred. Please try again.");
            console.error("Error updating user data", error.response?.data || err.message);
        }
    };

    const nationalityOptions = [
        { label: 'ไทย', value: 'TH' },
        { label: 'ลาว', value: 'LA' }
    ];

    return (
        <div className='mx-2 md:mx-0'>
            <h1 className="m-0 mt-2 p-0 font-semibold">บัญชีของฉัน</h1>
            <div>
                <div className='bg-section-product w-full flex flex-column border-1 surface-border border-round mt-2 py-3 px-3 bg-white border-round-mb justify-content-center align-self-center'>
                    <div className='flex justify-content-between'>
                        <h2 className="m-0 p-0 font-medium">ข้อมูลบัญชี</h2>
                        <div>
                            {editMode && (
                                <Button label="ยกเลิก" onClick={handleCancelEdit} className="text-500 p-0 m-0 mr-5" text />
                            )}
                            <Button label={editMode ? "บันทึกโปรไฟล์" : "แก้ไขโปรไฟล์"} onClick={editMode ? handleUpdateProfile : handleEditToggle} className="p-0 m-0" text />
                        </div>
                    </div>
                    <div className="card mt-3 flex flex-column gap-3 justify-content-center">
                        {errorMessage && <Message severity="error" text={errorMessage} />}
                        {user ? (
                            <div className='w-full'>
                                <div className='grid align-items-center border-bottom-1 surface-border'>
                                    <p className='col-3'>ชื่อ</p>
                                    <div className='col'>
                                        {editMode ? (
                                            <InputText name="name" value={formData.name} onChange={handleInputChange} />
                                        ) : (
                                            <p>{user.name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className='grid align-items-center border-bottom-1 surface-border'>
                                    <p className='col-3'>รหัสประเทศ</p>
                                    <div className='col'>
                                        {editMode ? (
                                            <InputText name="phone_prefix" value={formData.phone_prefix} onChange={handleInputChange} />
                                        ) : (
                                            <p>{user.phone_prefix}</p>
                                        )}
                                    </div>
                                </div>
                                <div className='grid align-items-center border-bottom-1 surface-border'>
                                    <p className='col-3'>เบอร์โทรศัพท์</p>
                                    <div className='col'>
                                        {editMode ? (
                                            <InputText name="phone" value={formData.phone} onChange={handleInputChange} keyfilter="pint" />
                                        ) : (
                                            <p>{user.phone}</p>
                                        )}
                                    </div>
                                </div>
                                <div className='grid align-items-center border-bottom-1 surface-border'>
                                    <p className='col-3'>สัญชาติ</p>
                                    <div className='col'>
                                        {editMode ? (
                                            <Dropdown
                                                value={formData.region}
                                                onChange={(e) => setFormData({ ...formData, region: e.value })}
                                                options={nationalityOptions}
                                                optionLabel="label"
                                                placeholder="เลือกสัญชาติ"
                                                className="w-full md:w-14rem"
                                            />
                                        ) : (
                                            <p>{user.region === 'TH' ? 'ไทย' : user.region === 'LA' ? 'ลาว' : 'ไม่ทราบ'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className='grid align-items-start border-bottom-1 surface-border pt-2'>
                                    <p className='col-3'>รหัสผ่าน</p>
                                    <div className='col'>
                                        {editPasswordMode ? (
                                            <div className='flex flex-column w-13rem gap-2 mb-2'>

                                                <FloatLabel className="w-full">
                                                    <Password
                                                        inputId="old_password"
                                                        value={formPassword.old_password}
                                                        onChange={handleInputPasswordChange}
                                                        feedback={false}
                                                        className="w-full"
                                                        toggleMask
                                                    />
                                                    <label htmlFor="old_password">กรุณาป้อนรหัสผ่านเก่า</label>
                                                </FloatLabel>
                                                <FloatLabel className="w-full">
                                                    <Password
                                                        inputId="new_password"
                                                        value={formPassword.new_password}
                                                        onChange={handleInputPasswordChange}
                                                        feedback={false}
                                                        className="w-full"
                                                        toggleMask
                                                    />
                                                    <label htmlFor="new_password">กรุณาป้อนรหัสผ่านใหม่</label>
                                                </FloatLabel>
                                            </div>
                                        ) : (
                                            <div>
                                                <p>*********</p>
                                            </div>
                                        )}
                                        <div>
                                            {editPasswordMode && (
                                                <Button label="ยกเลิก" onClick={handleCancelPasswordEdit} className="text-500 p-0 m-0 mr-5" text />
                                            )}
                                            <Button label={editPasswordMode ? "บันทึก" : "เปลี่ยนรหัสผ่าน"} onClick={editPasswordMode ? handleUpdatePassword : handleEditPasswordToggle} className="p-0 m-0" text />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <ProgressSpinner />
                            </>
                        )}
                    </div>
                </div>
                <UserAddress />
            </div>

        </div>
    )
}

export default MyAccount