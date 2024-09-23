import Products from "../../component/Products";
import { useState, useRef, useEffect } from "react";
import { useCart } from '../../router/CartContext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Footer from "../../component/Footer";
import { Link, useLocation } from 'react-router-dom';
import { Galleria } from 'primereact/galleria';
import img_placeholder from '../../assets/img_placeholder.png';
import axios from "axios";

function ProductPage() {
  const location = useLocation();
  const product = location.state?.product;
  const { addToCart } = useCart();
  const [dataCarousel, setDataCarousel] = useState([]);
  const [partnerItemsCount, setPartnerItemsCount] = useState(0);
  const [partnerPhone, setPartnerPhone] = useState('');
  const [data, setData] = useState([]);
  const apiProductUrl = import.meta.env.VITE_REACT_APP_API_PARTNER;

  const shuffleArray = (array) => {
    return array.sort(() => 0.5 - Math.random());
  };

  const fetchData = (category, product_id) => {
    axios({
      method: "get",
      url: `${apiProductUrl}/product`,
    })
      .then((response) => {
        const filteredData = response.data.data.filter(
          (item) => item.product_category === category && item._id !== product_id
        );
        const shuffledData = shuffleArray(filteredData);
        setDataCarousel(shuffledData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (product) {
      const category = product.product_category;
      fetchData(category, product._id);
    }
  }, [product]);

  const fetchPartnerItemsCount = (partner_id) => {
    axios({
      method: "get",
      url: `${apiProductUrl}/product`,
    })
      .then((response) => {
        const products = response.data.data;

        const partnerProductsCount = products.filter(
          (item) => item.product_partner_id._id === partner_id
        ).length;
        setPartnerItemsCount(partnerProductsCount);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (product) {
      fetchPartnerItemsCount(product.product_partner_id._id);
    }
  }, [product]);

  const fetchPartnerPhone = (partner_id) => {
    axios({
      method: "get",
      url: `${apiProductUrl}/partner`,
    })
      .then((response) => {
        const partners = response.data.data;
        const partner = partners.find((partner) => partner._id === partner_id);
        
        if (partner) {
          setPartnerPhone(partner.partner_phone);
        } else {
          console.log("Partner not found");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (product) {
      fetchPartnerPhone(product.product_partner_id._id);
    }
  }, [product]);


  const toast = useRef(null);
  const show = () => {
    toast.current.show({
      severity: 'success', summary: 'เพิ่มในตะกร้าแล้ว', life: 2000
    });
  };

  useEffect(() => {
    if (product) {
      const productImages = [
        {
          imgURL: `${product?.product_subimage1 ? apiProductUrl + product.product_subimage1 : product?.product_subimage2 ? apiProductUrl + product.product_subimage2 : product?.product_subimage3 ? apiProductUrl + product.product_subimage3 : img_placeholder}`,
        },
        {
          imgURL: `${product?.product_subimage2 ? apiProductUrl + product.product_subimage2 : product?.product_subimage3 ? apiProductUrl + product.product_subimage3 : img_placeholder}`,
        },
        {
          imgURL: `${product?.product_subimage3 ? apiProductUrl + product.product_subimage3 : img_placeholder}`,
        },
      ];
      setData(productImages);
      setCurrentImageURL(productImages[0]?.imgURL || img_placeholder);
    }
  }, [product, apiProductUrl]);

  // const responsiveOptions = [
  //   {
  //     breakpoint: "991px",
  //     numVisible: 3,
  //   },
  //   {
  //     breakpoint: "767px",
  //     numVisible: 3,
  //   },
  //   {
  //     breakpoint: "575px",
  //     numVisible: 3,
  //   },
  // ];

  // const itemTemplate = (item) => {
  //   return <img src={item.imgURL} alt='' style={{ width: '70%' }} />
  // }

  // const thumbnailTemplate = (item) => {
  //   return <img src={item.imgURL} alt='' style={{ width: '100%' }} />
  // }

  if (!product) {
    return <div>Product not found</div>;
  }

  const [currentImageURL, setCurrentImageURL] = useState('');

  const handleThumbnailClick = (imgURL) => {
    setCurrentImageURL(imgURL);
  };
  return (
    <>
      <Toast ref={toast} position="top-center" />
      <div className="m-3 flex justify-content-center flex-wrap">
        <div className="flex flex-column">
          <div className="flex align-items-center w-full p-2 bg-white border-round-lg shadow-2 mb-3">
            <div>
              <img src='https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?t=st=1725683041~exp=1725686641~hmac=24a4b302a6875df2ef03c07f9bc693b8354efe24b4c024a7841ccfe627dd7a96&w=826' alt='' width={70} height={70} className="border-circle" />
            </div>
            <div className="ml-3 w-full flex justify-content-between align-items-center">
              <div>
                <p className="m-0">ผู้ขาย: {product.product_partner_id.partner_name}</p>
                <p className="m-0">เบอร์โทร: {partnerPhone}</p>
                <p className="m-0">{partnerItemsCount} รายการสินค้า</p>
              </div>
              <div className="flex flex-column gap-2">
                <Link to={`/ShopPage/${product.product_partner_id._id}`} state={{ product }}>
                  <Button label="ดูร้านค้า" className="py-1 px-3" />
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:flex gap-4">
            <div className="md:w-full lg:w-30rem shadow-2 border-round-lg bg-white p-4 mb-3 lg:mb-0 flex justify-content-center">
              <div className="galleria-container">
                <div className="galleria-main">
                  <img src={currentImageURL} alt="Main" className="main-image" />
                </div>
                <div className="galleria-thumbnails">
                  {data.map((item, index) => (
                    <img
                      key={index}
                      src={item.imgURL}
                      alt={`Thumbnail ${index + 1}`}
                      className={`thumbnail ${currentImageURL === item.imgURL ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(item.imgURL)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="md:w-full lg:w-30rem p-3 bg-white border-round-lg shadow-2 mb-3 lg:mb-0">
              <div className="">
                <div className="flex justify-content-between align-items-center">
                  <h2 className="m-0 p-0 font-semibold text-900">฿{Number(product.product_price).toLocaleString('en-US')}</h2>
                  <p className="m-0 p-0 font-semibold text-900">คลัง : {product.product_stock}</p>
                </div>
                <p className="mt-2 p-0 font-semibold text-900">ประเภทสินค้า : {product.product_provider === 'coop' ? 'สินค้าสหกรณ์' : 'สินค้าทั่วไป'}</p>
                <p className="mt-2 p-0 font-semibold text-900">หมวดหมู่ : {product.product_category}</p>
                <h3 className="font-semibold pb-2 border-bottom-1 surface-border">{product.product_name}</h3>
                <p dangerouslySetInnerHTML={{ __html: product.product_detail }}></p>
              </div>
              <div className="flex justify-content-end">

                <Button
                  className="w-fit"
                  icon="pi pi-plus"
                  label="เพิ่มสินค้าในตะกร้า"
                  onClick={() => {
                    addToCart(product)
                    show()
                  }}
                />
              </div>


            </div>
          </div>

        </div>

        <div className="w-full">
          <h2 className="mb-2 font-semibold">สินค้าอื่นๆ ที่เกี่ยวข้อง</h2>
          {dataCarousel.length > 0 ? <Products data={dataCarousel} startIndex={0} /> : (
            <div className="w-full flex justify-content-start">
              <p className="m-0 ml-8 mt-2 p-0">ไม่พบสินค้าที่เกี่ยวข้องในตอนนี้</p>

            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductPage;