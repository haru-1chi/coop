import React, { useState, useEffect } from 'react'
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from "primereact/floatlabel";
import { Checkbox } from 'primereact/checkbox';
import ProvinceSelection from "../../component/ProvinceSelection";
import { Dropdown } from 'primereact/dropdown';
function UserAddress() {
    const apiCoopUrl = import.meta.env.VITE_REACT_APP_API_COOP;
    const apiUrl = import.meta.env.VITE_REACT_APP_API_PLATFORM;
    const [visible1, setVisible1] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [visible3, setVisible3] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [address, setAddress] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [newAddress, setNewAddress] = useState({
        title: "",
        address: "",
        province: "",
        amphure: "",
        district: "",
        zipcode: "",
        mainAddress: false,
    });

    const fetchUserAddress = async () => {
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");
        try {
            const res = await axios.get(`${apiCoopUrl}/users/${user_id}/address/get`, {
                headers: { "auth-token": `bearer ${token}` }
            });
            setAddress(res.data.data);
        } catch (err) {
            console.error("Error fetching user address", err.response?.data || err.message);
        }
    };

    const fetchUserData = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${apiCoopUrl}/me`, {
                headers: { "auth-token": `bearer ${token}` }
            });
            setUser(res.data.data);

            if (selectedAddress?._id) {
                setSelectedAddress((prev) => ({
                    ...prev,
                    mainAddress: user.mainAddress === prev._id,
                }));
            }
        } catch (err) {
            console.error("Error fetching user data", err.response?.data || err.message);
        }
    };

    useEffect(() => {
        fetchUserAddress();
        fetchUserData();
    }, [apiUrl]);

    const handlenewAddressInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setNewAddress((prevAddress) => ({
            ...prevAddress,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddressInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setSelectedAddress((prevAddress) => ({
            ...prevAddress,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleConfirmNewAddress = async () => {
        // const errors = validateForm();
        // if (Object.keys(errors).length > 0) {
        //     setValidationErrors(errors);
        //     return;
        // }
        const addNewAddress = {
            title: newAddress.title,
            address: newAddress.address,
            province: newAddress.province.name_th,
            amphure: newAddress.amphure.name_th,
            district: newAddress.district.name_th,
            zipcode: newAddress.zipcode,
        }
        console.log(addNewAddress)
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");
        try {
            const res = await axios.post(
                `${apiCoopUrl}/users/${user_id}/address/create`,
                addNewAddress,
                { headers: { "auth-token": `bearer ${token}` } }
            );
            console.log("New address created:", res.data.data);
            if (newAddress.mainAddress) {
                const newAddressId = res.data.data._id;
                await axios.put(
                    `${apiCoopUrl}/users/${user_id}/address/set-main-address`,
                    { _id: newAddressId },
                    { headers: { "auth-token": `bearer ${token}` } }
                );
                console.log("New address set as main address.");
            }
            await fetchUserData();
            await fetchUserAddress();
            setVisible3(false);
        } catch (err) {
            console.error("Error fetching user address", err.response?.data || err.message);
        }
    };

    const handleConfirmUpdateAddress = async () => {
        // const errors = validateForm();
        // if (Object.keys(errors).length > 0) {
        //     setValidationErrors(errors);
        //     return;
        // }
        const newSelectedAddress = {
            _id: selectedAddress._id,
            title: selectedAddress.title,
            address: selectedAddress.address,
            province: selectedAddress.province.name_th,
            amphure: selectedAddress.amphure.name_th,
            district: selectedAddress.district.name_th,
            zipcode: selectedAddress.zipcode,
        }
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");
        try {
            const res = await axios.put(`${apiCoopUrl}/users/${user_id}/address/update`, newSelectedAddress, {
                headers: { "auth-token": `bearer ${token}` }
            });
            console.log(res.data.data)
            if (selectedAddress.mainAddress) {
                await axios.put(
                    `${apiCoopUrl}/users/${user_id}/address/set-main-address`,
                    { _id: newSelectedAddress._id },
                    { headers: { "auth-token": `bearer ${token}` } }
                );
                console.log("New address set as main address.");
            }
            await fetchUserData();
            await fetchUserAddress();
            setVisible1(false);
        } catch (err) {
            console.error("Error fetching user address", err.response?.data || err.message);
        }
    };

    const handleDelete = async () => {
        const newSelectedAddress = {
            _id: selectedAddress._id,
        }
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");
        try {
            const res = await axios.post(`${apiCoopUrl}/users/${user_id}/address/delete`, newSelectedAddress, {
                headers: { "auth-token": `bearer ${token}` }
            });
            await fetchUserAddress();
            setVisible2(false);
        } catch (err) {
            console.error("Error fetching user address", err.response?.data || err.message);
        }
    };

    //
    const [provinces, setProvinces] = useState([]);
    const [amphures, setAmphures] = useState([]);
    const [tambons, setTambons] = useState([]);

    const handleEditClick = async (address) => {
        setLoading(true);
        setSelectedAddress({
            ...address,
            mainAddress: user?.mainAddress === address?._id,
        });
        try {
            await fetchProvinces();
            if (address.province) {
                await fetchAmphures(address.province);
            }
            if (address.amphure) {
                await fetchTambons(address.amphure);
            }
            setVisible1(true);
        } catch (error) {
            console.error("Error fetching address data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json');
            setProvinces(response.data);
            if (selectedAddress?.province) {
                const selectedProvince = response.data.find(province => province.name_th === (selectedAddress.province.name_th || selectedAddress.province));
                setSelectedAddress(prevData => ({ ...prevData, province: selectedProvince }));
            }
        } catch (err) {
            console.error("Error fetching", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }

    const fetchAmphures = async () => {
        if ((selectedAddress?.province && typeof selectedAddress.province === 'object') || (newAddress?.province && typeof newAddress?.province === 'object')) {
            setLoading(true);
            try {
                const response = await axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json');
                const filteredAmphures = response.data.filter(amphure => amphure.province_id === selectedAddress?.province.id || amphure.province_id === newAddress?.province.id);
                setAmphures(filteredAmphures);
                if (typeof selectedAddress.amphure === 'string') {
                    const selectedAmphure = filteredAmphures.find(amphure => amphure.name_th === selectedAddress?.amphure);
                    if (selectedAmphure) {
                        setSelectedAddress(prevData => ({
                            ...prevData,
                            amphure: selectedAmphure
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        } else {
            setAmphures([]);
            setTambons([]);
        }
    }

    const fetchTambons = async () => {
        if ((selectedAddress?.amphure && typeof selectedAddress?.amphure === 'object') || (newAddress?.amphure && typeof newAddress?.amphure === 'object')) {
            setLoading(true);
            try {
                const response = await axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json');
                const filteredTambons = response.data.filter(tambon => tambon.amphure_id === selectedAddress?.amphure.id || tambon.amphure_id === newAddress?.amphure.id);
                setTambons(filteredTambons);

                if (typeof selectedAddress.district === 'string') {
                    const selectedTambon = filteredTambons.find(tambon => tambon.name_th === selectedAddress?.district);
                    if (selectedTambon) {
                        setSelectedAddress(prevData => ({
                            ...prevData,
                            district: selectedTambon,
                            zipcode: selectedTambon ? selectedTambon?.zip_code : ''
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching", err.response.data || err.message);
            } finally {
                setLoading(false);
            }
        } else {
            setTambons([]);
        }
    }

    useEffect(() => {
        fetchProvinces();
    }, [selectedAddress?.province]);

    useEffect(() => {
        fetchAmphures();
    }, [selectedAddress?.province, newAddress?.province]);

    useEffect(() => {
        fetchTambons();
    }, [selectedAddress?.amphure, newAddress?.amphure]);

    const handleTambonChange = (e) => {
        const selectedTambon = e.value;
        setSelectedAddress(prevData => ({
            ...prevData,
            district: selectedTambon,
            zipcode: selectedTambon ? selectedTambon.zip_code : ''
        }));
    };

    const handlenewTambonChange = (e) => {
        const selectedTambon = e.value;
        setNewAddress(prevData => ({
            ...prevData,
            district: selectedTambon,
            zipcode: selectedTambon ? selectedTambon.zip_code : ''
        }));
    };

    return (
        <>
            <div className='bg-section-product w-full flex flex-column border-1 surface-border border-round mt-3 py-3 px-3 bg-white border-round-mb justify-content-center align-self-center'>
                <div className='flex justify-content-between'>
                    <h2 className="m-0 p-0 font-medium">ที่อยู่ของฉัน</h2>
                    <Button className='py-2 cursor-pointer' label='เพิ่มที่อยู่ใหม่'
                        onClick={() => {
                            setVisible3(true);
                        }} />
                </div>
                {address && (
                    address.map((address) => (
                        <div key={address._id} className='flex justify-content-between align-items-start border-bottom-1 surface-border'>
                            <div>
                                <p>ที่อยู่ {`${address?.address}, ${address?.district}, ${address?.amphure}, ${address?.province}, ${address?.zipcode}`}</p>
                                {user?.mainAddress === address._id ? (
                                    <p className='w-fit px-1 border-1 border-round border-primary'>ค่าเริ่มต้น</p>
                                ) : (
                                    ""
                                )}
                            </div>
                            <div className='text-right'>
                                <div className='flex gap-2 justify-content-end'>
                                    <p
                                        className='text-blue-500 cursor-pointer'
                                        onClick={() => {
                                            handleEditClick(address);
                                        }}
                                    >
                                        แก้ไข
                                    </p>
                                    <p
                                        className='text-blue-500 cursor-pointer'
                                        onClick={() => {
                                            setVisible2(true);
                                            setSelectedAddress({ ...address });
                                        }}
                                    >
                                        ลบ
                                    </p>
                                </div>
                                {/* {address.isDefault ? (
                                    <Button label='ตั้งเป็นค่าเริ่มต้น' outlined className='px-2 py-1 text-900 border-primary' disabled />
                                ) : (
                                    <Button label='ตั้งเป็นค่าเริ่มต้น' outlined className='px-2 py-1 text-900 border-primary' />
                                )} */}
                            </div>
                        </div >
                    ))
                )}
            </div >
            <Dialog
                header={<h3 className="font-semibold m-0">ต้องการลบที่อยู่นี้?</h3>}
                visible={visible2}
                style={{ width: "500px" }}
                onHide={() => setVisible2(false)}
                closable={false}
            >
                <div className='flex justify-content-end gap-3 mt-4'>
                    <Button onClick={() => setVisible2(false)} label='ยกเลิก' text />
                    <Button onClick={handleDelete} label='ลบ' />
                </div>
            </Dialog>

            {/* new address */}
            <Dialog
                header={<h3 className="font-semibold m-0">ที่อยู่จัดส่ง</h3>}
                visible={visible3}
                style={{ width: "500px" }}
                onHide={() => setVisible3(false)}
                closable={false}
            >
                <div className='flex justify-content-start align-items-center pt-3'>
                    <label>ติดป้ายเป็น:</label>
                    <InputText id="title" value={newAddress?.title}
                        onChange={handlenewAddressInputChange}
                        className='ml-3 w-10rem p-2'
                        placeholder='บ้าน, ที่ทำงาน, อื่นๆ...'
                    />
                </div>

                <div className="flex flex-column gap-4 mt-4">
                    <div>
                        <InputText id="address" value={newAddress?.address} onChange={handlenewAddressInputChange} className="w-full" placeholder='บ้านเลขที่, ซอย, หมู่, ถนน' />
                        {validationErrors.address && <small className="p-error">{validationErrors.address}</small>}
                    </div>

                    <div className="block md:flex justify-content-center gap-3">
                        <FloatLabel className="w-full md:w-14rem">
                            <Dropdown
                                filter
                                inputId="dd-province"
                                value={newAddress?.province || null}
                                onChange={(e) => setNewAddress(prevData => ({ ...prevData, province: e.value }))}
                                options={provinces}
                                optionLabel="name_th"
                                placeholder="Select a Province"
                                className="w-full"
                            />
                            <label htmlFor="dd-province">เลือกจังหวัด</label>
                            {/* {validationErrors.customer_province && <small className="p-error">{validationErrors.customer_province}</small>} */}
                        </FloatLabel>

                        <FloatLabel className="w-full md:w-14rem mt-3 md:mt-0">
                            <Dropdown
                                filter
                                inputId="dd-amphure"
                                value={newAddress?.amphure || null}
                                onChange={(e) => setNewAddress(prevData => ({ ...prevData, amphure: e.value }))}
                                options={amphures}
                                optionLabel="name_th"
                                placeholder="Select an Amphure"
                                className="w-full"
                                disabled={!newAddress?.province}
                            />
                            <label htmlFor="dd-amphure">เลือกอำเภอ</label>
                            {/* {validationErrors.customer_amphure && <small className="p-error">{validationErrors.customer_amphure}</small>} */}
                        </FloatLabel>
                    </div>

                    <div className="block md:flex justify-content-center gap-3 mt-3">
                        <FloatLabel className="w-full md:w-14rem md:mt-0">
                            <Dropdown
                                filter
                                inputId="dd-tambon"
                                value={newAddress?.district || null}
                                onChange={handlenewTambonChange}
                                options={tambons}
                                optionLabel="name_th"
                                placeholder="Select a Tambon"
                                className="w-full"
                                disabled={!newAddress?.amphure}
                            />
                            <label htmlFor="dd-tambon">เลือกตำบล</label>
                            {/* {validationErrors.customer_tambon && <small className="p-error">{validationErrors.customer_tambon}</small>} */}
                        </FloatLabel>

                        <FloatLabel className="w-full md:w-14rem mt-3 md:mt-0">
                            <InputText
                                className="w-full"
                                type="text"
                                value={newAddress?.zipcode || ''}
                                onChange={(e) => newAddress(prevData => ({ ...prevData, zipcode: e.target.value }))}
                            />
                            <label htmlFor="dd-zipcode">รหัสไปรษณีย์</label>
                            {/* {validationErrors.customer_zipcode && <small className="p-error">{validationErrors.customer_zipcode}</small>} */}
                        </FloatLabel>

                    </div>

                    <div>
                        <Checkbox
                            id="mainAddress"
                            checked={newAddress?.mainAddress}
                            onChange={handlenewAddressInputChange}
                            className="mt-2"
                        />
                        <label htmlFor='mainAddress' className="ml-2">ตั้งเป็นที่อยู่เริ่มต้น</label>
                    </div>

                </div>
                <div className='flex justify-content-end gap-3 mt-4'>
                    <Button onClick={() => setVisible3(false)} label='ยกเลิก' text />
                    <Button label='ยืนยัน' onClick={handleConfirmNewAddress} />
                </div>
            </Dialog>

            {selectedAddress && (
                <Dialog
                    header={<h3 className="font-semibold m-0">ที่อยู่จัดส่ง</h3>}
                    visible={visible1}
                    style={{ width: "500px" }}
                    onHide={() => setVisible1(false)}
                    closable={false}
                >
                    <div className='flex justify-content-start align-items-center pt-3'>
                        <label>ติดป้ายเป็น:</label>
                        <InputText id="title" value={selectedAddress?.title}
                            onChange={handleAddressInputChange}
                            className='ml-3 w-10rem p-2'
                            placeholder='บ้าน, ที่ทำงาน, อื่นๆ...'
                        />
                    </div>

                    <div className="flex flex-column gap-4 mt-4">
                        <div>
                            <InputText id="address" value={selectedAddress?.address} onChange={handleAddressInputChange} className="w-full" placeholder='บ้านเลขที่, ซอย, หมู่, ถนน' />
                            {validationErrors.address && <small className="p-error">{validationErrors.address}</small>}
                        </div>

                        <div className="block md:flex justify-content-center gap-3">
                            <FloatLabel className="w-full md:w-14rem">
                                <Dropdown
                                    filter
                                    inputId="dd-province"
                                    value={selectedAddress?.province}
                                    onChange={(e) => setSelectedAddress(prevData => ({ ...prevData, province: e.value }))}
                                    options={provinces}
                                    optionLabel="name_th"
                                    placeholder="Select a Province"
                                    className="w-full"
                                />
                                <label htmlFor="dd-province">เลือกจังหวัด</label>
                                {/* {validationErrors.customer_province && <small className="p-error">{validationErrors.customer_province}</small>} */}
                            </FloatLabel>

                            <FloatLabel className="w-full md:w-14rem mt-3 md:mt-0">
                                <Dropdown
                                    filter
                                    inputId="dd-amphure"
                                    value={selectedAddress?.amphure}
                                    onChange={(e) => setSelectedAddress(prevData => ({ ...prevData, amphure: e.value }))}
                                    options={amphures}
                                    optionLabel="name_th"
                                    placeholder="Select an Amphure"
                                    className="w-full"
                                    disabled={!selectedAddress?.province}
                                />
                                <label htmlFor="dd-amphure">เลือกอำเภอ</label>
                                {/* {validationErrors.customer_amphure && <small className="p-error">{validationErrors.customer_amphure}</small>} */}
                            </FloatLabel>
                        </div>

                        <div className="block md:flex justify-content-center gap-3 mt-3">
                            <FloatLabel className="w-full md:w-14rem md:mt-0">
                                <Dropdown
                                    filter
                                    inputId="dd-tambon"
                                    value={selectedAddress?.district}
                                    onChange={handleTambonChange}
                                    options={tambons}
                                    optionLabel="name_th"
                                    placeholder="Select a Tambon"
                                    className="w-full"
                                    disabled={!selectedAddress?.district}
                                />
                                <label htmlFor="dd-tambon">เลือกตำบล</label>
                                {/* {validationErrors.customer_tambon && <small className="p-error">{validationErrors.customer_tambon}</small>} */}
                            </FloatLabel>

                            <FloatLabel className="w-full md:w-14rem mt-3 md:mt-0">
                                <InputText
                                    className="w-full"
                                    type="text"
                                    value={selectedAddress?.zipcode || ''}
                                    onChange={(e) => setSelectedAddress(prevData => ({ ...prevData, zipcode: e.target.value }))}
                                />
                                <label htmlFor="dd-zipcode">รหัสไปรษณีย์</label>
                                {/* {validationErrors.customer_zipcode && <small className="p-error">{validationErrors.customer_zipcode}</small>} */}
                            </FloatLabel>

                        </div>

                        <div>
                            <Checkbox
                                id="mainAddress"
                                checked={selectedAddress?.mainAddress}
                                onChange={handleAddressInputChange}
                                className="mt-2"
                            />
                            <label htmlFor='mainAddress' className="ml-2">ตั้งเป็นที่อยู่เริ่มต้น</label>
                        </div>

                    </div>
                    <div className='flex justify-content-end gap-3 mt-4'>
                        <Button onClick={() => setVisible1(false)} label='ยกเลิก' text />
                        <Button label='ยืนยัน' onClick={handleConfirmUpdateAddress} />
                    </div>
                </Dialog>
            )}
        </>
    )
}

export default UserAddress
