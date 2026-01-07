import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ArrowRight, Check, Upload, CreditCard, Lock } from 'lucide-react';
import { HeaderElements } from '../components/HeaderElements';
import { Button } from '../components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Input, Label, Select } from '../components/Input';
import { Alert } from '../components/Alert';

const T_SHIRT_COLORS = [
  'Black', 'Butter Yellow', 'Charcoal Grey', 'Coffee Brown', 'Golden Yellow',
  'Iris Lavender', 'Light Pink', 'Liril Green', 'Maroon', 'Melange Grey',
  'Mustard Yellow', 'Navy Blue', 'Olive Green', 'Orange', 'Red',
  'Royal Blue', 'Sky Blue', 'White'
];

const T_SHIRT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];


export default function App() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { userName, userImage, email, selectedImage, prompt, timestamp, selectedImageIndex } = router.query;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }
  
  const [currentStage, setCurrentStage] = useState(1);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imagePosition, setImagePosition] = useState('center'); // Image position on shirt
  const [positionCoords, setPositionCoords] = useState({ x: 50, y: 50 }); // Percentage-based coordinates
  const [imageSize, setImageSize] = useState(50); // Percentage size
  const [isDragging, setIsDragging] = useState(false);
  const [orderPrice, setOrderPrice] = useState(null);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address1: '',
    address2: '',
    address3: '',
    pincode: '',
    city: '',
    mobileNumber: '',
    email: email || '',
    tshirtColor: '',
    tshirtSize: '',
    state: '',
    country: '',
    fileResponse: null,
    imagePosition: 'center'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const confirmImage = () => {
    setFile(selectedImage);
    setCurrentStage(2); // Go to image positioning stage
  };

  const confirmPosition = () => {
    setCustomerDetails(prev => ({ 
      ...prev, 
      imagePosition,
      positionCoords,
      imageSize 
    }));
    setCurrentStage(3); // Go to t-shirt details stage
  };

  const calculatePrice = async () => {
    // Use backend pricing logic
    const USD_RATE = 83; // 1 USD = 83 INR
    const gst = 5; // 5% GST
    
    // Base prices in USD (matching backend logic)
    let basePrice;
    if (customerDetails.tshirtSize === 'S' || customerDetails.tshirtSize === 'M' || 
        customerDetails.tshirtSize === 'L' || customerDetails.tshirtSize === 'XL') {
      basePrice = 2.75;
    } else if (customerDetails.tshirtSize === '2XL') {
      basePrice = 2.95;
    } else if (customerDetails.tshirtSize === '3XL') {
      basePrice = 3.20;
    } else if (customerDetails.tshirtSize === '4XL') {
      basePrice = 3.45;
    } else if (customerDetails.tshirtSize === '5XL') {
      basePrice = 3.60;
    } else {
      basePrice = 2.75; // Default
    }
    
    const printingPrice = 2.00; // ~160 INR / 83
    
    // Courier charge - use default if pincode not provided
    let courierCharge = 0.60; // Default estimate
    if (customerDetails.pincode) {
      // If pincode is provided, we could fetch actual courier charge
      // For now, use default
      courierCharge = 0.60;
    }
    
    // Calculate total following backend logic
    const subtotal = courierCharge + basePrice + printingPrice;
    
    // Profit should be 150% of subtotal
    const profit = subtotal * 1.50;
    
    // GST is 5% on (subtotal + profit)
    const totalBeforeGST = subtotal + profit;
    const gstAmount = (totalBeforeGST * gst) / 100;
    const finalTotal = totalBeforeGST + gstAmount;
    
    // Set price breakdown
    setPriceBreakdown({
      basePrice: basePrice.toFixed(2),
      printingPrice: printingPrice.toFixed(2),
      courierCharge: courierCharge.toFixed(2),
      subtotal: subtotal.toFixed(2),
      profit: profit.toFixed(2),
      gst: gstAmount.toFixed(2),
      total: finalTotal.toFixed(2)
    });
    
    setOrderPrice(Math.round(finalTotal * 100) / 100);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPositionCoords({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFormSubmit = async () => {
    if (!file) {
      setSubmitError('Please confirm your image selection');
      setCurrentStage(1);
      return;
    }

    if (!customerDetails.tshirtColor || !customerDetails.tshirtSize) {
      setSubmitError('Please select t-shirt color and size');
      setCurrentStage(3);
      return;
    }

    if (!customerDetails.name || !customerDetails.email || !customerDetails.mobileNumber || 
        !customerDetails.address1 || !customerDetails.pincode || !customerDetails.city || 
        !customerDetails.state || !customerDetails.country) {
      setSubmitError('Please fill in all required shipping details');
      setCurrentStage(4);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Upload file to Printrove first
      const uploadUrl = 'https://api.printrove.com/api/external/designs';
      const AUTH_KEY = process.env.NEXT_PUBLIC_SKIBDSS;
      
      const binaryString = atob(file.replace(/^data:image\/\w+;base64,/, ''));
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      const formData = new FormData();
      formData.append('file', blob, `design_${Date.now()}.png`);

      const fileResponse = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${AUTH_KEY}`,
          Accept: 'application/json',
        },
      });

      const updatedCustomerDetails = {
        ...customerDetails,
        file: file, // Send base64 file
        fileResponse: fileResponse.data, // Send Printrove response
        imagePosition: imagePosition || 'center',
        positionCoords: positionCoords || { x: 50, y: 50 },
        imageSize: imageSize || 50,
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://tweeshirt-backend-e05d2bws2-kaushiks-projects-c93da684.vercel.app';
      const formUrl = `${backendUrl}/submit_form`;
      const response = await axios.post(formUrl, updatedCustomerDetails);

      if (response.data.success) {
        setSubmitSuccess(true);
        console.log('Order placed successfully:', response.data);
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.response?.data?.message || error.message || 'Failed to submit your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Order Details - Tweeshirt</title>
      </Head>

      <div className="min-h-screen relative">
        <HeaderElements />
        <main className="w-full flex flex-col items-center min-h-[calc(100vh-5rem)] py-12">
          <div className="w-full max-w-4xl px-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/image')}
              className="mb-4 text-slate-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((stage) => (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStage >= stage
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                          : 'border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-600'
                      }`}
                    >
                      {currentStage > stage ? <Check className="h-5 w-5" /> : stage}
                    </div>
                    {stage < 5 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 ${
                          currentStage > stage ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Confirm</span>
              <span>Position</span>
              <span>T-Shirt</span>
              <span>Details</span>
              <span>Payment</span>
            </div>
          </div>

          {submitSuccess ? (
            <Card className="bg-glass-dark border-violet-500/30 text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-lg shadow-blue-500/25">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="font-display text-2xl text-white">Order Submitted!</CardTitle>
                <CardDescription className="text-slate-400">
                  Your order has been received and is being processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/')} className="w-full">
                  Return Home
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {currentStage === 1 && (
                <Card className="bg-glass-dark border-violet-500/30">
                  <CardHeader>
                    <CardTitle className="font-display text-white">Confirm Your Design</CardTitle>
                    <CardDescription className="text-slate-400">
                      Review your selected design before proceeding
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedImage && (
                      <div className="flex justify-center">
                        <img
                          src={selectedImage && (selectedImage.startsWith('http') ? selectedImage : `data:image/png;base64,${selectedImage}`)}
                          alt="Selected design"
                          className="h-auto w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/image')}
                        className="flex-1"
                      >
                        Generate Again
                      </Button>
                      <Button
                        onClick={confirmImage}
                        className="flex-1"
                      >
                        Confirm & Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStage === 2 && (
                <Card className="bg-glass-dark border-violet-500/30">
                  <CardHeader>
                    <CardTitle className="font-display text-white">Image Position</CardTitle>
                    <CardDescription className="text-slate-400">
                      Drag the image to position it on the t-shirt, or use preset positions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'top', label: 'Top', icon: '⬆️' },
                        { value: 'center', label: 'Center', icon: '🎯' },
                        { value: 'bottom', label: 'Bottom', icon: '⬇️' },
                        { value: 'left', label: 'Left', icon: '⬅️' },
                        { value: 'right', label: 'Right', icon: '➡️' },
                        { value: 'custom', label: 'Custom', icon: '🎨' },
                      ].map((pos) => (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => {
                            setImagePosition(pos.value);
                            if (pos.value === 'top') setPositionCoords({ x: 50, y: 20 });
                            else if (pos.value === 'center') setPositionCoords({ x: 50, y: 50 });
                            else if (pos.value === 'bottom') setPositionCoords({ x: 50, y: 80 });
                            else if (pos.value === 'left') setPositionCoords({ x: 25, y: 50 });
                            else if (pos.value === 'right') setPositionCoords({ x: 75, y: 50 });
                          }}
                          className={`rounded-lg border-2 p-4 text-center transition-all ${
                            imagePosition === pos.value
                              ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                              : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                          }`}
                        >
                          <div className="text-2xl mb-2">{pos.icon}</div>
                          <div className="text-sm text-slate-300">{pos.label}</div>
                        </button>
                      ))}
                    </div>
                    
                    {selectedImage && (
                      <div className="mt-6">
                        <div className="mb-4">
                          <Label className="text-slate-300">Image Size: {imageSize}%</Label>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={imageSize}
                            onChange={(e) => setImageSize(Number(e.target.value))}
                            className="mt-2 w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                        <div className="flex justify-center">
                          <div 
                            className="relative w-64 h-80 border-2 border-slate-700 rounded-lg bg-slate-800/30 p-4 cursor-move"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                          >
                            <div className="absolute inset-4 border border-dashed border-slate-600 rounded"></div>
                            <img
                              src={selectedImage && (selectedImage.startsWith('http') ? selectedImage : `data:image/png;base64,${selectedImage}`)}
                              alt="Preview"
                              draggable={false}
                              className={`absolute object-contain transition-all ${
                                isDragging ? 'cursor-grabbing' : 'cursor-grab'
                              }`}
                              style={{
                                width: `${imageSize}%`,
                                height: `${imageSize}%`,
                                left: `${positionCoords.x}%`,
                                top: `${positionCoords.y}%`,
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                              }}
                            />
                            <div 
                              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
                              style={{
                                left: `${positionCoords.x}%`,
                                top: `${positionCoords.y}%`,
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-4 text-center text-sm text-slate-400">
                          Position: {Math.round(positionCoords.x)}%, {Math.round(positionCoords.y)}%
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStage(1)}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={confirmPosition}
                        className="flex-1"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStage === 3 && (
                <Card className="bg-glass-dark border-violet-500/30">
                  <CardHeader>
                    <CardTitle className="font-display text-white">T-Shirt Details</CardTitle>
                    <CardDescription className="text-slate-400">
                      Choose your t-shirt color and size
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="tshirtColor" required>
                        T-Shirt Color
                      </Label>
                      <Select
                        id="tshirtColor"
                        name="tshirtColor"
                        value={customerDetails.tshirtColor}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      >
                        <option value="">Select a color</option>
                        {T_SHIRT_COLORS.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tshirtSize" required>
                        T-Shirt Size
                      </Label>
                      <Select
                        id="tshirtSize"
                        name="tshirtSize"
                        value={customerDetails.tshirtSize}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      >
                        <option value="">Select a size</option>
                        {T_SHIRT_SIZES.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStage(2)}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={async () => {
                          await calculatePrice();
                          setCurrentStage(4);
                        }}
                        disabled={!customerDetails.tshirtColor || !customerDetails.tshirtSize}
                        className="flex-1"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStage === 4 && (
                <Card className="bg-glass-dark border-violet-500/30">
                  <CardHeader>
                    <CardTitle className="font-display text-white">Shipping Information</CardTitle>
                    <CardDescription className="text-slate-400">
                      Enter your delivery details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {submitError && (
                      <Alert variant="error" onDismiss={() => setSubmitError(null)}>
                        {submitError}
                      </Alert>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="name" required>Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={customerDetails.name}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="email" required>Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={customerDetails.email}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="mobileNumber" required>Mobile Number</Label>
                        <Input
                          id="mobileNumber"
                          name="mobileNumber"
                          type="tel"
                          value={customerDetails.mobileNumber}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address1" required>Address Line 1</Label>
                        <Input
                          id="address1"
                          name="address1"
                          value={customerDetails.address1}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                          id="address2"
                          name="address2"
                          value={customerDetails.address2}
                          onChange={handleInputChange}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address3">Address Line 3</Label>
                        <Input
                          id="address3"
                          name="address3"
                          value={customerDetails.address3}
                          onChange={handleInputChange}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" required>City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={customerDetails.city}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode" required>Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={customerDetails.pincode}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" required>State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={customerDetails.state}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" required>Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={customerDetails.country}
                          onChange={handleInputChange}
                          className="mt-1.5"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStage(3)}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={async () => {
                          await calculatePrice();
                          if (orderPrice) {
                            setCurrentStage(5);
                          }
                        }}
                        className="flex-1"
                      >
                        Proceed to Payment
                        <CreditCard className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStage === 5 && (
                <Card className="bg-glass-dark border-violet-500/30">
                  <CardHeader>
                    <CardTitle className="font-display text-white flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Payment Required
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Complete payment to place your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {submitError && (
                      <Alert variant="error" onDismiss={() => setSubmitError(null)}>
                        {submitError}
                      </Alert>
                    )}

                    <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6">
                      <div className="space-y-3">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-white mb-3">T-Shirt ({customerDetails.tshirtSize}, {customerDetails.tshirtColor})</h3>
                        </div>
                        
                        {/* Price Breakdown */}
                        {priceBreakdown ? (
                          <>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between text-slate-300">
                                <span>Base Price ({customerDetails.tshirtSize})</span>
                                <span className="text-white">${priceBreakdown.basePrice}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Printing Price</span>
                                <span className="text-white">${priceBreakdown.printingPrice}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Courier Charge</span>
                                <span className="text-white">${priceBreakdown.courierCharge}</span>
                              </div>
                              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-600">
                                <span>Subtotal</span>
                                <span className="text-white font-medium">${priceBreakdown.subtotal}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Profit</span>
                                <span className="text-white">${priceBreakdown.profit}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>GST (5%)</span>
                                <span className="text-white">${priceBreakdown.gst}</span>
                              </div>
                            </div>
                            <div className="border-t border-slate-600 pt-4 mt-4">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-white">Total Amount</span>
                                <span className="text-2xl font-bold text-blue-400">${priceBreakdown.total}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <span className="text-slate-400">Calculating price...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border-2 border-blue-500/30 bg-blue-500/10 p-4">
                      <p className="text-sm text-slate-300">
                        <strong className="text-white">Payment Method:</strong> For now, this is a demo payment. 
                        In production, integrate with Stripe, Razorpay, or your preferred payment gateway.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="paymentConfirm"
                          checked={paymentConfirmed}
                          onChange={(e) => setPaymentConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor="paymentConfirm" className="text-sm text-slate-300">
                          I confirm that I want to proceed with the payment of ${orderPrice || '0'}
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStage(4)}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleFormSubmit}
                        loading={submitting}
                        disabled={submitting || !paymentConfirmed || !orderPrice}
                        className="flex-1"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        {paymentConfirmed ? 'Confirm Payment & Place Order' : 'Confirm Payment First'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          </div>
        </main>
      </div>
    </>
  );
}
