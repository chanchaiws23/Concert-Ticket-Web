import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrderById, generateQRCode, verifySlipImage, confirmPayment } from '../api';
import type { Order } from '../types';
import { useToast } from '../hooks/useToast';
import Loading from '../components/Loading';
import Swal from 'sweetalert2';

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    if (!id) {
      navigate('/my-orders');
      return;
    }
    loadOrder();
  }, [id, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderById(parseInt(id!));
      setOrder(orderData);
      
      const amount = typeof orderData.total_amount === 'string' 
        ? parseFloat(orderData.total_amount) 
        : Number(orderData.total_amount) || 0;
      setPaymentAmount(amount);

      // Generate QR Code
      if (amount > 0) {
        try {
          const qrResponse = await generateQRCode({ amount });
          console.log('QR Response:', {
            success: qrResponse.success,
            hasQrBase64: !!qrResponse.qr_base64,
            qrBase64Length: qrResponse.qr_base64?.length,
            qrBase64Preview: qrResponse.qr_base64?.substring(0, 50),
            format: qrResponse.format,
            mime_type: qrResponse.mime_type
          });
          
          if (qrResponse.success && qrResponse.qr_base64) {
            // ตรวจสอบว่า qr_base64 เป็น data URI ที่ถูกต้อง
            let qrDataUri = qrResponse.qr_base64;
            
            // ถ้ายังไม่ใช่ data URI ให้สร้างขึ้นมา
            if (!qrDataUri.startsWith('data:image/')) {
              console.log('QR code is not a data URI, creating one...');
              // ถ้าเป็น base64 string ธรรมดา ให้สร้าง data URI
              const mimeType = qrResponse.mime_type || 'image/png';
              qrDataUri = `data:${mimeType};base64,${qrDataUri}`;
            }
            
            // ตรวจสอบว่าเป็น data URI ที่ถูกต้อง
            if (qrDataUri.startsWith('data:image/')) {
              console.log('QR code format is valid, setting QR code');
              console.log('QR code data URI length:', qrDataUri.length);
              console.log('QR code data URI preview:', qrDataUri.substring(0, 100));
              
              // Set QR code state
              setQrCode(qrDataUri);
              
              // ตรวจสอบว่า state ถูก set หรือไม่
              setTimeout(() => {
                console.log('QR code state after setting:', qrDataUri.substring(0, 50));
                // ตรวจสอบว่า image element มีอยู่จริงหรือไม่
                const imgElement = document.querySelector('img[alt="QR Code"]');
                if (imgElement) {
                  console.log('✅ QR Code image element found');
                  console.log('Image src:', (imgElement as HTMLImageElement).src.substring(0, 50));
                } else {
                  console.warn('⚠️ QR Code image element not found in DOM');
                }
              }, 200);
            } else {
              console.error('Invalid QR code format:', qrDataUri.substring(0, 100));
              showToast('รูปแบบ QR Code ไม่ถูกต้อง', 'error');
            }
          } else {
            console.error('QR code generation failed:', qrResponse);
            showToast('ไม่สามารถสร้าง QR Code ได้', 'error');
          }
        } catch (error: any) {
          console.error('Error generating QR code:', error);
          showToast(error.response?.data?.message || 'ไม่สามารถสร้าง QR Code ได้', 'error');
        }
      }
    } catch (error: any) {
      showToast('ไม่พบคำสั่งซื้อ', 'error');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        showToast('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น', 'error');
        return;
      }

      // ตรวจสอบขนาดไฟล์ (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('ไฟล์ขนาดใหญ่เกินไป (สูงสุด 5MB)', 'error');
        return;
      }

      setSlipFile(file);
      
      // สร้าง preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipFile || !order) {
      showToast('กรุณาเลือกไฟล์สลิปการโอนเงิน', 'error');
      return;
    }

    setUploading(true);
    try {
      const response = await verifySlipImage({
        order_id: order.id,
        amount: paymentAmount,
        file: slipFile,
      });

      if (response.success) {
        await Swal.fire({
          title: 'อัปโหลดสำเร็จ!',
          text: 'กำลังรอการตรวจสอบสลิปการโอนเงิน',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
        navigate('/my-orders');
      }
    } catch (error: any) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
    } finally {
      setUploading(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!order) return;

    const result = await Swal.fire({
      title: 'ยืนยันการชำระเงิน',
      text: `ยืนยันว่าคำสั่งซื้อ ${order.order_code || `#${order.id}`} ได้รับการชำระเงินแล้ว?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl',
      },
    });

    if (result.isConfirmed) {
      try {
        await confirmPayment({
          order_id: order.id,
          amount: paymentAmount,
        });
        await Swal.fire({
          title: 'ยืนยันสำเร็จ!',
          text: 'การชำระเงินได้รับการยืนยันแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
        navigate('/my-orders');
      } catch (error: any) {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยัน',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
      }
    }
  };

  if (loading || !order) {
    return <Loading fullScreen />;
  }

  const isPaid = order.status === 'PAID';
  const isPending = order.status === 'PENDING';
  const isAdmin = auth?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      {ToastComponent}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <button
            onClick={() => navigate('/my-orders')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center cursor-pointer"
          >
            ← กลับไปยังบัตรของฉัน
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="mr-3">💳</span>
            ชำระเงิน
          </h1>
          <p className="text-gray-600">Order {order.order_code || `#${order.id}`}</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">สรุปคำสั่งซื้อ</h2>
          <div className="space-y-3 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-800">{item.name}</span>
                <span className="text-gray-600">x{item.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
            <span className="text-xl font-semibold text-gray-800">ยอดรวมทั้งสิ้น</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ฿{Number(paymentAmount).toLocaleString('th-TH')}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        {isPaid && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="text-6xl mb-4">✅</div>
            </div>
            <h3 className="text-2xl font-bold text-green-800 text-center mb-2">ชำระเงินเรียบร้อยแล้ว</h3>
            <p className="text-green-600 text-center">คำสั่งซื้อของคุณได้รับการยืนยันแล้ว</p>
          </div>
        )}

        {/* Payment Methods */}
        {isPending && (
          <div className="space-y-6">
            {/* QR Code Payment */}
            {qrCode ? (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📱</span>
                  ชำระผ่าน PromptPay
                </h2>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4 flex items-center justify-center min-h-[256px]">
                    {qrCode && (
                      <img 
                        key={qrCode.substring(0, 50)} // Force re-render when QR code changes
                        src={qrCode} 
                        alt="QR Code" 
                        className="w-64 h-64 max-w-full max-h-64 object-contain"
                        style={{ 
                          display: 'block',
                          minWidth: '256px',
                          minHeight: '256px',
                          imageRendering: 'crisp-edges'
                        }}
                        onError={(e) => {
                          console.error('❌ QR Code image failed to load');
                          console.error('QR Code src preview:', qrCode.substring(0, 100));
                          console.error('QR Code src length:', qrCode.length);
                          console.error('Image element:', e.currentTarget);
                          showToast('ไม่สามารถแสดง QR Code ได้ กรุณารีเฟรชหน้า', 'error');
                        }}
                        onLoad={(e) => {
                          console.log('✅ QR Code loaded successfully');
                          console.log('QR Code dimensions:', {
                            naturalWidth: e.currentTarget.naturalWidth,
                            naturalHeight: e.currentTarget.naturalHeight,
                            displayWidth: e.currentTarget.width,
                            displayHeight: e.currentTarget.height
                          });
                        }}
                      />
                    )}
                  </div>
                  <p className="text-gray-600 text-center mb-4">
                    สแกน QR Code เพื่อชำระเงินผ่านแอปธนาคารของคุณ
                  </p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 w-full">
                    <p className="text-sm text-blue-800 font-semibold mb-2">💡 วิธีชำระเงิน:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                      <li>เปิดแอปธนาคารของคุณ</li>
                      <li>เลือกชำระผ่าน QR Code</li>
                      <li>สแกน QR Code ด้านบน</li>
                      <li>ตรวจสอบจำนวนเงินและยืนยันการโอน</li>
                      <li>อัปโหลดสลิปการโอนเงินด้านล่าง</li>
                      <li>โปรดชำระเงินภายใน 10 นาที</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📱</span>
                  ชำระผ่าน PromptPay
                </h2>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 p-8 rounded-xl border-2 border-gray-200 mb-4 flex items-center justify-center min-h-[256px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">กำลังสร้าง QR Code...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Slip */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📄</span>
                อัปโหลดสลิปการโอนเงิน
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกไฟล์สลิปการโอนเงิน
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    รองรับไฟล์รูปภาพ (JPG, PNG) ขนาดไม่เกิน 5MB
                  </p>
                </div>

                {slipPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">ตัวอย่างสลิป:</p>
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                      <img 
                        src={slipPreview} 
                        alt="Slip Preview" 
                        className="max-w-full h-auto rounded-lg mx-auto"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUploadSlip}
                  disabled={!slipFile || uploading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'กำลังอัปโหลด...' : '📤 อัปโหลดสลิปการโอนเงิน'}
                </button>
              </div>
            </div>

            {/* Manual Confirm (Admin only) */}
            {isAdmin && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">⚙️</span>
                  ยืนยันการชำระเงิน (Admin)
                </h2>
                <p className="text-gray-600 mb-4">
                  สำหรับ Admin: สามารถยืนยันการชำระเงินได้โดยไม่ต้องอัปโหลดสลิป
                </p>
                <button
                  onClick={handleManualConfirm}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ✅ ยืนยันการชำระเงิน
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

