import React, { useState, useEffect } from 'react'
import axios from "axios";
import { RadioButton } from 'primereact/radiobutton';
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { formatDate } from "../utils/DateTimeFormat";
function ListlistAddresses({ visible, setVisible, user, listAddress, setAddress, setIsUsingNewAddress }) {
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const handleSelectAddress = (addressId) => {
        setSelectedAddressId(addressId);
    };

    const handleConfirm = () => {
        const selectedAddress = listAddress.find(address => address._id === selectedAddressId);
        if (selectedAddress) {
            setAddress(selectedAddress);
        }
        setIsUsingNewAddress(true);
        setVisible(false);
    };

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
                    {listAddress && listAddress.map((address) => (
                        <div key={address._id} className='flex align-items-center border-bottom-1 surface-border'>
                            <RadioButton
                                inputId={address._id}
                                name="address"
                                value={address._id}
                                checked={selectedAddressId === address._id}
                                onChange={() => handleSelectAddress(address._id)}
                            />
                            <div>
                                <p className='ml-3'>ที่อยู่ {`${address?.address}, ${address?.district}, ${address?.amphure}, ${address?.province}, ${address?.zipcode}`}</p>
                            </div>
                        </div >
                    ))}
                    <div className='flex justify-content-end'>
                        <Button className="w-fit mt-2" label="ยืนยัน" size="small" onClick={handleConfirm} />
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ListlistAddresses