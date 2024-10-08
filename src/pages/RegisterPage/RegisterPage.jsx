import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import Navbar from "../../component/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const apiUrl = import.meta.env.VITE_REACT_APP_API_PLATFORM;
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    ref_tel: "",
    tel: "",
    prefix: "",
    fristname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    address: "",
    subdistrict: "",
    district: "",
    province: "",
    postcode: "",
  });

  const validateForm = () => {
    const {
      tel,
      prefix,
      fristname,
      lastname,
      password,
      confirmPassword,
      address,
      subdistrict,
      district,
      province,
      postcode,
    } = formData;

    if (!prefix || !tel || !fristname || !lastname || !password || !confirmPassword ||
      !address || !subdistrict || !district || !province || !postcode) {
      return "กรุณากรอกข้อมูลทุกช่อง";
    }

    if (!/^\d{10}$/.test(tel)) {
      return "เบอร์โทรศัพท์ต้องเป็นตัวเลข";
    }

    if (password !== confirmPassword) {
      return "รหัสผ่านไม่ตรงกัน";
    }

    return null;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const newFormData = {
      ref_tel: formData.ref_tel || '0909500709',
      prefix: formData.prefix,
      fristname: formData.fristname,
      lastname: formData.lastname,
      tel: formData.tel,
      password: formData.password,
      //
      address: formData.address,
      subdistrict: formData.subdistrict.name_th,
      district: formData.district.name_th,
      province: formData.province.name_th,
      postcode: String(formData.postcode),
      current_address: {
        address: formData.address,
        subdistrict: formData.subdistrict.name_th,
        district: formData.district.name_th,
        province: formData.province.name_th,
        postcode: String(formData.postcode),
      },
    }
    console.log(newFormData)
    try {
      const response = await axios.post(`${apiUrl}/member/create`, newFormData);
      console.log(response);
      if (response.data.status) {
        console.log("Register successful", response.data);
        navigate("/LoginPage");
      } else {
        setErrorMessage(response.data.message || "Register failed");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred. Please try again.");
      console.error("Registration error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  //
  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json')
      .then(response => {
        setProvinces(response.data);
        if (formData.province) {
          const selectedProvince = response.data.find(province => province.name_th === formData.province.name_th);
          setFormData(prevData => ({ ...prevData, province: selectedProvince }));
        }
      });
  }, []);

  useEffect(() => {
    if (formData.province && typeof formData.province === 'object') {
      axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json')
        .then(response => {
          const filteredAmphures = response.data.filter(amphure => amphure.province_id === formData.province.id);
          setAmphures(filteredAmphures);

          if (typeof formData.district === 'string') {
            const selectedAmphure = filteredAmphures.find(amphure => amphure.name_th === formData.district);
            if (selectedAmphure) {
              setFormData(prevData => ({
                ...prevData,
                district: selectedAmphure
              }));
            }
          }
        });
    } else {
      setAmphures([]);
      setTambons([]);
    }
  }, [formData.province]);


  useEffect(() => {
    if (formData.district && typeof formData.district === 'object') {
      axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json')
        .then(response => {
          const filteredTambons = response.data.filter(tambon => tambon.amphure_id === formData.district.id);
          setTambons(filteredTambons);

          if (typeof formData.subdistrict === 'string') {
            const selectedTambon = filteredTambons.find(tambon => tambon.name_th === formData.subdistrict);
            if (selectedTambon) {
              setFormData(prevData => ({
                ...prevData,
                subdistrict: selectedTambon
              }));
            }
          }
        });
    } else {
      setTambons([]);
    }
  }, [formData.district]);

  const handleTambonChange = (e) => {
    const selectedTambon = e.value;
    setFormData(prevData => ({
      ...prevData,
      subdistrict: selectedTambon,
      postcode: selectedTambon ? selectedTambon.zip_code : ''
    }));
  };

  const prefixes = [
    { name: "นาย", value: "นาย" },
    { name: "นาง", value: "นาง" },
    { name: "นางสาว", value: "นางสาว" },
    { name: "ไม่ระบุ", value: "ไม่ระบุ" }
  ];

  return (
    <>
      <div className='w-full flex flex-column gap-2 justify-content-center'>
        <div className='bg-section-product w-fit flex flex-column border-1 surface-border border-round mt-5 py-3 px-3 bg-white border-round-mb justify-content-center align-self-center'>
          <h2 className="p-0 m-0">สมัครสมาชิก</h2>
          <p className="p-0 my-1">สร้างบัญชีง่ายๆ ใน 1 นาที แล้วเลือกซื้อสินค้าที่คุณต้องการได้เลย</p>
          <div className="card my-4 flex flex-column justify-content-center">
            <FloatLabel className="w-full mb-3">
              <label htmlFor="ref_tel">เบอร์มือถือผู้อ้างอิง (ไม่บังคับ)</label>
              <InputText
                id="ref_tel"
                value={formData.ref_tel}
                onChange={handleInputChange}
                className="w-full"
                keyfilter="pint"
              />
            </FloatLabel>
            <FloatLabel className="w-full mb-3">
              <label htmlFor="tel">เบอร์มือถือ</label>
              <InputText
                id="tel"
                value={formData.tel}
                onChange={handleInputChange}
                className="w-full"
                keyfilter="pint"
              />
            </FloatLabel>

            {/* <FloatLabel className="w-full mb-3">
              <label htmlFor="email">อีเมล (ไม่บังคับ)</label>
              <InputText
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
                keyfilter="email"
              />
            </FloatLabel> */}
            <FloatLabel className="w-full mb-3">
              <Dropdown
                filter
                inputId="prefix"
                value={formData.prefix}
                onChange={(e) => setFormData(prevData => ({ ...prevData, prefix: e.value }))}
                options={prefixes}
                optionLabel="name"
                placeholder="ระบุคำนำหน้า"
                className="w-full"
              />
              <label htmlFor="prefix">เลือกคำนำหน้า</label>
            </FloatLabel>

            <FloatLabel className="w-full mb-3">
              <label htmlFor="fristname">ชื่อ</label>
              <InputText
                id="fristname"
                value={formData.fristname}
                onChange={handleInputChange}
                className="w-full"
              />
            </FloatLabel>

            <FloatLabel className="w-full mb-3">
              <label htmlFor="lastname">นามสกุล</label>
              <InputText
                id="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                className="w-full"
              />
            </FloatLabel>

            <FloatLabel className="w-full mb-3">
              <Password
                inputId="password"
                value={formData.password}
                onChange={handleInputChange}
                feedback={false}
                className="w-full"
                toggleMask
              />
              <label htmlFor="password">รหัสผ่าน</label>
            </FloatLabel>

            <FloatLabel className="w-full mb-3">
              <Password
                inputId="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                feedback={false}
                className="w-full"
                toggleMask
              />
              <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
            </FloatLabel>
            
            <FloatLabel className="w-full mb-3">
              <label htmlFor="address">ที่อยู่</label>
              <InputText
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full"
              />
            </FloatLabel>

            <div className="block md:flex justify-content-center gap-3">
              <FloatLabel className="w-full md:w-14rem">
                <Dropdown
                  filter
                  inputId="dd-province"
                  value={formData.province || null}
                  onChange={(e) => setFormData(prevData => ({ ...prevData, province: e.value }))}
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
                  value={formData.district || null}
                  onChange={(e) => setFormData(prevData => ({ ...prevData, district: e.value }))}
                  options={amphures}
                  optionLabel="name_th"
                  placeholder="Select an Amphure"
                  className="w-full"
                  disabled={!formData.province}
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
                  value={formData.subdistrict || null}
                  onChange={handleTambonChange}
                  options={tambons}
                  optionLabel="name_th"
                  placeholder="Select a Tambon"
                  className="w-full"
                  disabled={!formData.district}
                />
                <label htmlFor="dd-tambon">เลือกตำบล</label>
                {/* {validationErrors.customer_tambon && <small className="p-error">{validationErrors.customer_tambon}</small>} */}
              </FloatLabel>

              <FloatLabel className="w-full md:w-14rem mt-3 md:mt-0">
                <InputText
                  className="w-full"
                  type="text"
                  value={formData.postcode || ''}
                  onChange={(e) => setFormData(prevData => ({ ...prevData, postcode: e.target.value }))}
                />
                <label htmlFor="dd-zipcode">รหัสไปรษณีย์</label>
                {/* {validationErrors.customer_zipcode && <small className="p-error">{validationErrors.customer_zipcode}</small>} */}
              </FloatLabel>

            </div>

            {errorMessage && <Message severity="error" text={errorMessage} />}
            <Button
              className="my-3"
              label={loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              onClick={handleRegister}
              disabled={loading}
              rounded
            />

            <span className="text-center hidden">หรือ</span>
            <Button className="mt-3 mb-5 hidden" label="สร้างบัญชีธุรกิจ" outlined rounded />
            <a href="#" className="text-center hidden">บัญชีธุรกิจคืออะไร</a>
            <p className="text-center">มีบัญชีของอยู่แล้วใช่ไหม <a href={`${import.meta.env.VITE_APP_API_URL}`}>เข้าสู่ระบบที่นี่</a></p>
          </div>
        </div>
      </div>
      
    </>
  );
}

export default RegisterPage