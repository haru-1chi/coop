import React, { useState, useEffect } from 'react'
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { formatDate } from "../utils/DateTimeFormat";
function TopupHistory({ visible, setVisible, user }) {
    const apiCoopUrl = import.meta.env.VITE_REACT_APP_API_COOP;
    const [topup, setTopup] = useState(0)
    const [topupHistory, setTopupHistory] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${apiCoopUrl}/coupons`, {
                    headers: { "auth-token": `bearer ${token}` }
                });
                const sortedData = res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                console.log(res)
                setTopupHistory(sortedData);
            } catch (err) {
                console.error(
                    "Error fetching user data",
                    err.response?.data || err.message
                );
            }
        };
        fetchData();
    }, [apiCoopUrl]);

    // const handleTopup = async () => {
    //     const addCoupon = {
    //         ref_code: "",
    //         ref_type: "e-market",
    //         amount: topup,
    //         user_id: user._id,
    //     };
    //     console.log(addCoupon)
    //     const token = localStorage.getItem("token");
    //     try {
    //         const useCouponResponse = await axios.post(`${apiCoopUrl}/coupons/add`, addCoupon, {
    //             headers: { "auth-token": `bearer ${token}` }
    //         });
    //         console.log(useCouponResponse.data);
    //         setVisible(false);
    //         window.location.reload();
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }
    return (
        <>
            <Dialog
                header={<h3 className="font-semibold m-0">ประวัติการทำรายการ</h3>}
                visible={visible}
                style={{ width: "auto" }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <div className='w-22rem'>
                    {topupHistory && (
                        topupHistory.map((topup, index) => (
                            <div key={index} className='border-bottom-1 surface-border'>
                                <div className='flex justify-content-between align-items-center pt-1'>
                                    <p
                                        className={`m-0 text-xl font-semibold ${topup.amount * topup.operation_type > 0 ? 'text-green-600' : 'text-red-500'
                                            }`}
                                    >{topup.description}</p>
                                    <p
                                        className={`m-0 mt-2 text-xl font-semibold ${topup.amount * topup.operation_type > 0 ? 'text-green-600' : 'text-red-500'
                                            }`}
                                    >
                                        {(topup.amount * topup.operation_type).toLocaleString('en-US')}฿
                                    </p>
                                </div>
                                {topup.ref_code !== 'unknown' && <p className="m-0 my-2">เลขที่ออเดอร์: {topup.ref_code}</p>}
                                <p className="m-0 mb-2">{formatDate(topup.createdAt)}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className='flex justify-content-center'>
                    {/* <Button className="px-2 md:px-4 py-2" onClick={handleTopup} label='ชำระเงินตอนนี้' /> */}
                </div>
            </Dialog>
        </>
    )
}

export default TopupHistory