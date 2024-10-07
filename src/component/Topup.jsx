import React, { useState } from 'react'
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

function Topup({ visible, setVisible, user }) {
    const apiCoopUrl = import.meta.env.VITE_REACT_APP_API_COOP;
    const [topup, setTopup] = useState(0)

    const handleTopup = async () => {
        const addCoupon = {
            ref_code: "",
            ref_type: "e-market",
            amount: topup,
            user_id: user._id,
        };
        console.log(addCoupon)
        const token = localStorage.getItem("token");
        try {
            const useCouponResponse = await axios.post(`${apiCoopUrl}/coupons/add`, addCoupon, {
                headers: { "auth-token": `bearer ${token}` }
            });
            console.log(useCouponResponse.data);
            setVisible(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            <Dialog
                header={<h3 className="font-semibold m-0">เติมเงินสหกรณ์</h3>}
                visible={visible}
                style={{ width: "auto" }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <div>
                    <p className="m-0 mb-1">ระบุจำนวนเงิน</p>
                </div>
                <InputText id="label" className='w-15rem md:w-17rem p-2' placeholder='฿0' value={topup}
                    onChange={(e) => setTopup(e.target.value)} />
                <p>ยอดเงินปัจจุบัน: ฿{user?.coop_coupon}</p>
                <div className='border-top-1 surface-border'>
                    <div className='flex justify-content-between'>
                        <p>จำนวนเงินที่ต้องชำระ: </p>
                        <p>฿{topup}</p>
                    </div>
                </div>


                <div className='flex justify-content-center'>
                    <Button className="px-2 md:px-4 py-2" onClick={handleTopup} label='ชำระเงินตอนนี้' />
                </div>
            </Dialog>
        </>
    )
}

export default Topup