import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Divider,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Home,
  People,
  EventAvailable,
  AttachMoney,
  Warning,
  VerifiedUser,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../config/apiServices/apiServices";
import Loader from "../../components/loader/loader";

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [summaryData, statsData, alertsData] = await Promise.all([
          fetchData("dashboard/summary"),
          fetchData("dashboard/stats"),
          fetchData("dashboard/alerts"),
        ]);

        setSummary(summaryData);
        setStats(statsData);
        setAlerts(alertsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <Loader open />;

  return (
    <Box sx={{ px: 4, py: 3, bgcolor: "#f5f7fb", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform overview and operational insights
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {summary && (
        <>
          {/* Alerts */}
          {(alerts?.pendingListings > 0 ||
            alerts?.pendingVerifications > 0) && (
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    {alerts.pendingListings > 0 && (
                      <Grid item xs={12} md={6}>
                        <Alert
                          severity="warning"
                          variant="outlined"
                          action={
                            <Button
                              size="small"
                              onClick={() => navigate("/all-products")}
                            >
                              Review
                            </Button>
                          }
                        >
                          <AlertTitle>Pending Listings</AlertTitle>
                          {alerts.pendingListings} listings awaiting approval
                        </Alert>
                      </Grid>
                    )}

                    {alerts.pendingVerifications > 0 && (
                      <Grid item xs={12} md={6}>
                        <Alert
                          severity="info"
                          variant="outlined"
                          action={
                            <Button
                              size="small"
                              onClick={() => navigate("/cnic-verification")}
                            >
                              Verify
                            </Button>
                          }
                        >
                          <AlertTitle>CNIC Verifications</AlertTitle>
                          {alerts.pendingVerifications} users pending verification
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <KPICard
              title="Total Listings"
              value={summary.totalListings}
              subtitle={`${summary.pendingListings} pending`}
              icon={<Home />}
              color="#16a34a"
            />
            <KPICard
              title="Users"
              value={summary.totalHosts + summary.totalGuests}
              subtitle={`${summary.totalHosts} Hosts • ${summary.totalGuests} Guests`}
              icon={<People />}
              color="#2563eb"
            />
            <KPICard
              title="Active Bookings"
              value={summary.activeBookings}
              subtitle="Currently active"
              icon={<EventAvailable />}
              color="#ea580c"
            />
            <KPICard
              title="Revenue"
              value={`$${summary.revenueLifetime?.toLocaleString()}`}
              subtitle={`+$${summary.revenueThisMonth?.toLocaleString()} this month`}
              icon={<AttachMoney />}
              color="#7c3aed"
            />
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography fontWeight={600}>
                      Revenue Overview
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TrendingUp color="success" />
                      <Typography variant="caption">
                        Last 30 days
                      </Typography>
                    </Box>
                  </Box>

                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="_id"
                        tickFormatter={(d) =>
                          new Date(d).getDate()
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(d) =>
                          new Date(d).toDateString()
                        }
                      />
                      <Bar
                        dataKey="totalRevenue"
                        fill="#7c3aed"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent>
                  <Typography fontWeight={600} mb={2}>
                    Booking Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="_id"
                        tickFormatter={(d) =>
                          new Date(d).getDate()
                        }
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(d) =>
                          new Date(d).toDateString()
                        }
                      />
                      <Line
                        dataKey="totalBookings"
                        stroke="#ea580c"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

/* KPI Card */
const KPICard = ({ title, value, subtitle, icon, color }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
        transition: "all .2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              bgcolor: `${color}20`,
              color,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

export default Dashboard;
