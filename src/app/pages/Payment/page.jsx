'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Payment.module.css';

export default function Payment() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [freelancers, setFreelancers] = useState([]);
    const [amount, setAmount] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [clientId, setClientId] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [paypalSetupStatus, setPaypalSetupStatus] = useState({});

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(userData);
        fetchPayPalClientId();
        fetchFreelancers();
    }, []);

    const fetchPayPalClientId = async () => {
        try {
            const response = await fetch('http://127.0.0.1:25608/api/paypal/client-id');
            const data = await response.json();
            setClientId(data.client_id);
        } catch (error) {
            console.error('Error fetching PayPal client ID:', error);
        }
    };

    const fetchFreelancers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:25608/api/users', {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`
                }
            });
            const data = await response.json();
            setFreelancers(data.users || []);

            // Check PayPal setup status for each freelancer
            const statusPromises = data.users.map(freelancer => 
                checkFreelancerPayPalSetup(freelancer.id)
            );
            const statuses = await Promise.all(statusPromises);
            const statusMap = {};
            statuses.forEach((status, index) => {
                statusMap[data.users[index].id] = status;
            });
            setPaypalSetupStatus(statusMap);
        } catch (error) {
            console.error('Error fetching freelancers:', error);
        }
    };

    const checkFreelancerPayPalSetup = async (freelancerId) => {
        try {
            const response = await fetch(`http://127.0.0.1:25608/api/freelancer/paypal-setup`, {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`
                }
            });
            const data = await response.json();
            return data.has_paypal_setup;
        } catch (error) {
            console.error('Error checking PayPal setup:', error);
            return false;
        }
    };

    const handleCreateOrder = async () => {
        if (!selectedFreelancer || !amount || !projectDescription) {
            setError('გთხოვთ შეავსოთ ყველა ველი');
            return;
        }

        // Check if freelancer has PayPal setup
        if (!paypalSetupStatus[selectedFreelancer.id]) {
            setError('Selected freelancer has not set up PayPal payment method');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:25608/api/paypal/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    currency: 'USD',
                    freelancer_id: selectedFreelancer.id,
                    project_description: projectDescription
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setPaymentDetails({
                    totalAmount: data.total_amount,
                    platformFee: data.platform_fee,
                    freelancerAmount: data.freelancer_amount
                });
                return data.order_id;
            } else {
                throw new Error(data.message || 'Failed to create payment');
            }
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (data, actions) => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:25608/api/paypal/capture-order/${data.orderID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                // Show detailed success message
                alert(`
                    Payment successful!
                    Total: $${paymentDetails.totalAmount.toFixed(2)}
                    Platform fee (5%): $${paymentDetails.platformFee.toFixed(2)}
                    Freelancer receives: $${paymentDetails.freelancerAmount.toFixed(2)}
                `);
                router.push('/dashboard');
            } else {
                throw new Error(result.message || 'Failed to complete payment');
            }
        } catch (error) {
            setError(error.message);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = () => {
        if (!selectedFreelancer || !amount || !projectDescription) {
            setError('გთხოვთ შეავსოთ ყველა ველი');
            return;
        }
        
        // Validate amount
        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than 0');
            return;
        }
        
        setError('');
        setShowPayment(true);
    };

    if (!user) {
        return <div>იტვირთება...</div>;
    }

    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.main}>
                <div className={styles.paymentContainer}>
                    <h1 className={styles.title}>გადახდა</h1>
                    
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>აირჩიეთ ფრილანსერი</h2>
                        <div className={styles.freelancerGrid}>
                            {freelancers.map(freelancer => (
                                <div 
                                    key={freelancer.id}
                                    className={`${styles.freelancerCard} 
                                        ${selectedFreelancer?.id === freelancer.id ? styles.selected : ''}
                                        ${!paypalSetupStatus[freelancer.id] ? styles.disabled : ''}
                                    `}
                                    onClick={() => {
                                        if (paypalSetupStatus[freelancer.id]) {
                                            setSelectedFreelancer(freelancer);
                                        }
                                    }}
                                    title={!paypalSetupStatus[freelancer.id] ? "This freelancer hasn't set up PayPal" : ""}
                                >
                                    <div className={styles.freelancerInfo}>
                                        <h3>{freelancer.name}</h3>
                                        <p>{freelancer.email}</p>
                                        <p className={styles.skills}>{freelancer.skills || 'No skills specified'}</p>
                                        {!paypalSetupStatus[freelancer.id] && (
                                            <div className={styles.paypalWarning}>
                                                PayPal not set up
                                            </div>
                                        )}
                                    </div>
                                    {selectedFreelancer?.id === freelancer.id && (
                                        <div className={styles.checkmark}>✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>გადახდის დეტალები</h2>
                        
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>თანხა (USD)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className={styles.input}
                                min="1"
                                step="0.01"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>პროექტის აღწერა</label>
                            <textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Enter project description"
                                className={styles.textarea}
                                rows="4"
                            />
                        </div>

                        {amount && (
                            <div className={styles.feeBreakdown}>
                                <div className={styles.feeItem}>
                                    <span>Project value:</span>
                                    <span>${parseFloat(amount).toFixed(2)}</span>
                                </div>
                                <div className={styles.feeItem}>
                                    <span>Platform fee (5%):</span>
                                    <span>${(parseFloat(amount) * 0.05).toFixed(2)}</span>
                                </div>
                                <div className={styles.feeItem}>
                                    <span>Freelancer will receive:</span>
                                    <span>${(parseFloat(amount) * 0.95).toFixed(2)}</span>
                                </div>
                                <div className={styles.totalFee}>
                                    <span>Total to pay:</span>
                                    <span>${parseFloat(amount).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!showPayment ? (
                        <button 
                            onClick={handlePaymentClick}
                            className={styles.paymentButton}
                            disabled={loading || !selectedFreelancer || !amount || !projectDescription}
                        >
                            {loading ? 'Loading...' : 'Proceed to Payment'}
                        </button>
                    ) : (
                        <div className={styles.paypalSection}>
                            <h2 className={styles.sectionTitle}>PayPal Payment</h2>
                            {paymentDetails && (
                                <div className={styles.paymentSummary}>
                                    <p>You are paying <strong>${paymentDetails.totalAmount.toFixed(2)}</strong></p>
                                    <p>Platform will receive <strong>${paymentDetails.platformFee.toFixed(2)}</strong></p>
                                    <p>{selectedFreelancer?.name} will receive <strong>${paymentDetails.freelancerAmount.toFixed(2)}</strong></p>
                                </div>
                            )}
                            {clientId ? (
                                <PayPalScriptProvider 
                                    options={{ 
                                        "client-id": clientId,
                                        currency: "USD",
                                        "disable-funding": "credit,card"
                                    }}
                                >
                                    <PayPalButtons
                                        createOrder={handleCreateOrder}
                                        onApprove={handleApprove}
                                        onError={(err) => {
                                            console.error('PayPal Error:', err);
                                            setError('PayPal Error: ' + err.message);
                                        }}
                                        onCancel={() => {
                                            setError('Payment was cancelled');
                                            setShowPayment(false);
                                        }}
                                        style={{
                                            layout: 'vertical',
                                            color: 'blue',
                                            shape: 'rect',
                                            label: 'pay',
                                            height: 40
                                        }}
                                    />
                                </PayPalScriptProvider>
                            ) : (
                                <p>Loading PayPal...</p>
                            )}
                            <button 
                                onClick={() => setShowPayment(false)}
                                className={styles.backToFormButton}
                            >
                                Back to form
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}