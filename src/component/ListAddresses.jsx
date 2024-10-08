import React, { useState, useEffect } from 'react'
import axios from "axios";
import { RadioButton } from 'primereact/radiobutton';
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { formatDate } from "../utils/DateTimeFormat";
function ListlistAddresses({ visible, setVisible, user, listAddress }) {
    // const apiCoopUrl = import.meta.env.VITE_REACT_APP_API_COOP;
    // const [topup, setTopup] = useState(0)
    // const [topupHistory, setTopupHistory] = useState(null)

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const token = localStorage.getItem("token");
    //             const res = await axios.get(`${apiCoopUrl}/coupons`, {
    //                 headers: { "auth-token": `bearer ${token}` }
    //             });
    //             const sortedData = res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    //             console.log(res)
    //             setTopupHistory(sortedData);
    //         } catch (err) {
    //             console.error(
    //                 "Error fetching user data",
    //                 err.response?.data || err.message
    //             );
    //         }
    //     };
    //     fetchData();
    // }, [apiCoopUrl]);

    return (
        <>
            <Dialog
                header={<h3 className="font-semibold m-0">ที่อยู่ของฉัน</h3>}
                visible={visible}
                style={{ width: "auto" }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <div className='w-22rem'>
                    {listAddress && (
                        listAddress.map((listAddress) => (
                            <div key={listAddress._id} className='flex align-items-center border-bottom-1 surface-border'>
                                <RadioButton inputId="" name="" value="listAddress._id" />
                                <div>
                                    <p className='ml-3'>ที่อยู่ {`${listAddress?.address}, ${listAddress?.district}, ${listAddress?.amphure}, ${listAddress?.province}, ${listAddress?.zipcode}`}</p>
                                    {user?.mainlistAddress === listAddress._id ? (
                                        <p className='w-fit px-1 border-1 border-round border-primary'>ค่าเริ่มต้น</p>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div >
                        ))
                    )}
                    <div className='flex justify-content-end'>
                        <Button className="w-fit mt-2" label="ยืนยัน" size="small" />
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ListlistAddresses