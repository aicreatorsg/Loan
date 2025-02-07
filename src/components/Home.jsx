import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    useTheme,
    Button,
    IconButton
} from '@mui/material';
import {
    People as PeopleIcon,
    AccountBalance as AccountBalanceIcon,
    Payment as PaymentIcon,
    Assessment as AssessmentIcon,
    PersonAdd as PersonAddIcon,
    Timeline as TimelineIcon,
    WhatsApp as WhatsAppIcon,
    Phone as PhoneIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FarmerAnimation from './FarmerAnimation';

const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

export default function Home() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalLoanAmount: 0,
        totalCollections: 0,
        pendingAmount: 0,
        monthlyInterest: 0,
        totalInterestCollected: 0,
        activeLoans: 0
    });

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true
        });

        // Set up real-time listeners
        const membersRef = collection(db, 'members');
        const transactionsRef = collection(db, 'transactions');

        // Real-time listener for members
        const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
            let totalMembers = 0;
            let totalLoanAmount = 0;
            let pendingAmount = 0;
            let activeLoans = 0;
            let monthlyInterest = 0;

            snapshot.forEach((doc) => {
                const member = doc.data();
                totalMembers++;
                
                const loanAmount = Number(member.loanAmount || 0);
                const balance = Number(member.balance || 0);
                const interestRate = Number(member.interestRate || 2); // Default 2% per month

                if (balance > 0) {
                    activeLoans++;
                    monthlyInterest += (balance * interestRate) / 100;
                }

                totalLoanAmount += loanAmount;
                pendingAmount += balance;
            });

            setStats(prev => ({
                ...prev,
                totalMembers,
                totalLoanAmount,
                pendingAmount,
                activeLoans,
                monthlyInterest
            }));
        });

        // Real-time listener for transactions
        const unsubscribeTransactions = onSnapshot(
            query(transactionsRef, where('type', '==', 'payment')),
            (snapshot) => {
                let totalCollections = 0;
                let totalInterestCollected = 0;

                snapshot.forEach((doc) => {
                    const transaction = doc.data();
                    const amount = Number(transaction.amount || 0);
                    const interestAmount = Number(transaction.interestAmount || 0);
                    
                    totalCollections += amount;
                    totalInterestCollected += interestAmount;
                });

                setStats(prev => ({
                    ...prev,
                    totalCollections,
                    totalInterestCollected
                }));
            }
        );

        // Cleanup listeners
        return () => {
            unsubscribeMembers();
            unsubscribeTransactions();
        };
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const quickActions = [
        { title: 'सदस्य नोंदणी', icon: <PersonAddIcon />, path: '/register-member' },
        { title: 'हप्ता भरणा', icon: <PaymentIcon />, path: '/pay-installment' },
        { title: 'अहवाल पहा', icon: <AssessmentIcon />, path: '/reports' },
        { title: 'सदस्य यादी', icon: <PeopleIcon />, path: '/members' }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Hero Section */}
            <MotionPaper
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                sx={{
                    p: 6,
                    mb: 4,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    color: 'white',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Typography 
                                variant="h2" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 'bold',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                }}
                            >
                                विशाल शेतकरी संघटना
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                                शेतकऱ्यांच्या विकासासाठी कटिबद्ध
                            </Typography>
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <IconButton 
                                    color="inherit" 
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <WhatsAppIcon />
                                </IconButton>
                                <IconButton 
                                    color="inherit"
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <PhoneIcon />
                                </IconButton>
                                <IconButton 
                                    color="inherit"
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <EmailIcon />
                                </IconButton>
                            </Box>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <FarmerAnimation height="200px" />
                        </motion.div>
                    </Grid>
                </Grid>
            </MotionPaper>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    {
                        title: 'एकूण सदस्य',
                        value: stats.totalMembers,
                        icon: <PeopleIcon sx={{ fontSize: 40 }} />,
                        color: '#2196F3'
                    },
                    {
                        title: 'एकूण कर्ज रक्कम',
                        value: stats.totalLoanAmount,
                        icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
                        color: '#4CAF50',
                        isCurrency: true
                    },
                    {
                        title: 'एकूण जमा रक्कम',
                        value: stats.totalCollections,
                        icon: <PaymentIcon sx={{ fontSize: 40 }} />,
                        color: '#FF9800',
                        isCurrency: true
                    },
                    {
                        title: 'बाकी रक्कम',
                        value: stats.pendingAmount,
                        icon: <TimelineIcon sx={{ fontSize: 40 }} />,
                        color: '#F44336',
                        isCurrency: true
                    }
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.title}>
                        <MotionCard
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            sx={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`,
                                color: 'white',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    transition: 'transform 0.3s ease-in-out'
                                }
                            }}
                        >
                            <CardContent>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                                >
                                    {stat.icon}
                                </motion.div>
                                <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                                    {stat.title}
                                </Typography>
                                <Typography variant="h4">
                                    {stat.isCurrency ? (
                                        <CountUp
                                            end={stat.value}
                                            prefix="₹"
                                            separator=","
                                            duration={2}
                                        />
                                    ) : (
                                        <CountUp
                                            end={stat.value}
                                            duration={2}
                                        />
                                    )}
                                </Typography>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            {/* Interest Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <MotionPaper
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        sx={{
                            p: 3,
                            background: `linear-gradient(135deg, #6B1B9A 0%, #4A148C 100%)`,
                            color: 'white'
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        सक्रिय कर्ज
                                    </Typography>
                                    <Typography variant="h4">
                                        <CountUp
                                            end={stats.activeLoans}
                                            duration={2}
                                        />
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        मासिक व्याज
                                    </Typography>
                                    <Typography variant="h4">
                                        <CountUp
                                            end={stats.monthlyInterest}
                                            prefix="₹"
                                            separator=","
                                            decimals={2}
                                            duration={2}
                                        />
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        एकूण जमा व्याज
                                    </Typography>
                                    <Typography variant="h4">
                                        <CountUp
                                            end={stats.totalInterestCollected}
                                            prefix="₹"
                                            separator=","
                                            decimals={2}
                                            duration={2}
                                        />
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </MotionPaper>
                </Grid>
            </Grid>

            {/* Quick Actions with Farmer Theme */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <MotionPaper 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        sx={{ 
                            p: 3,
                            background: `linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)`,
                            color: 'white'
                        }}
                    >
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                >
                                    <FarmerAnimation height="150px" />
                                </motion.div>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                    जलद कार्ये
                                </Typography>
                                <Grid container spacing={2}>
                                    {quickActions.map((action, index) => (
                                        <Grid item xs={12} sm={6} key={action.title}>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    startIcon={action.icon}
                                                    onClick={() => navigate(action.path)}
                                                    fullWidth
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(255,255,255,0.2)'
                                                        }
                                                    }}
                                                >
                                                    {action.title}
                                                </Button>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        </Grid>
                    </MotionPaper>
                </Grid>
            </Grid>

            {/* Contact Section with Farmer Theme */}
            <MotionPaper
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                sx={{ 
                    mt: 4, 
                    p: 3, 
                    textAlign: 'center',
                    background: `linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 1 }}
                        >
                            <FarmerAnimation height="150px" />
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom>
                            संपर्क साधा
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            अधिक माहितीसाठी आमच्याशी संपर्क साधा
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<WhatsAppIcon />}
                                sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
                            >
                                WhatsApp
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PhoneIcon />}
                                sx={{ bgcolor: '#0088cc', '&:hover': { bgcolor: '#006699' } }}
                            >
                                कॉल करा
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<EmailIcon />}
                                sx={{ bgcolor: '#EA4335', '&:hover': { bgcolor: '#B92D21' } }}
                            >
                                ईमेल
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </MotionPaper>
        </Container>
    );
}
