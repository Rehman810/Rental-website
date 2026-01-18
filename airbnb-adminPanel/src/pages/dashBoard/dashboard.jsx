import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchData } from "../../config/apiServices/apiServices";
import Loader from "../../components/loader/loader";
import { BsCurrencyDollar } from "react-icons/bs";
import { AiOutlineFileDone } from "react-icons/ai";
import { SiVirustotal } from "react-icons/si";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { CheckCircle, Cancel, AccessTime } from "@mui/icons-material";
import FullCalendarComponent from "../../components/calendar/calendar";
import { format, isValid, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [barChartData, setBarChartData] = useState([]);
  const [dailyOrderData, setDailyOrderData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [dispatchedOrders, setDispatchedOrders] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [fullfilledOrders, setFullfilledOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [totalSales, setTotalSales] = useState();

  useEffect(() => {
    const fetchDataFromApi = async () => {
      try {
        const response = await fetchData("billing-details");
        const respons2 = await fetchData("total-sales/fulfilled");
        const products = response.result;
        setTotalSales(respons2.totalSales);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); 
        const currentYear = currentDate.getFullYear();

        const filteredOrders = products.filter((order) => {
          const orderDate = parseISO(order.orderDate);
          const orderMonth = orderDate.getMonth();
          const orderYear = orderDate.getFullYear();
          return orderMonth === currentMonth && orderYear === currentYear;
        });

        const total = products.length;
        const pending = products.filter(
          (order) => order.orderStatus === "Pending"
        ).length;
        const dispatched = products.filter(
          (order) => order.orderStatus === "Dispatched"
        ).length;
        const cancelled = products.filter(
          (order) => order.orderStatus === "Cancelled"
        ).length;
        const fullfilled = products.filter(
          (order) => order.orderStatus === "Fullfilled"
        ).length;

        setTotalOrders(total);
        setPendingOrders(pending);
        setDispatchedOrders(dispatched);
        setCancelledOrders(cancelled);
        setFullfilledOrders(fullfilled);
        setOrders(products);

        const formattedData = [
          { name: "Pending", value: pending },
          { name: "Dispatched", value: dispatched },
          { name: "FullFilled", value: fullfilled },
          { name: "Cancelled", value: cancelled },
        ];

        setBarChartData(formattedData);

        const dailyData = filteredOrders.reduce(
          (acc, order) => {
            const orderDate = parseISO(order.orderDate);

            if (isValid(orderDate)) {
              const dayOfMonth = format(orderDate, "d");
              acc.orders[dayOfMonth] = (acc.orders[dayOfMonth] || 0) + 1;
              if (order.orderStatus === "Fullfilled") {
                acc.sales[dayOfMonth] = (acc.sales[dayOfMonth] || 0) + 1; 
              }
            } else {
              console.warn(`Invalid date format: ${order.orderDate}`);
            }
            return acc;
          },
          { orders: {}, sales: {} }
        );

        const daysInMonth = Array.from({ length: 31 }, (_, i) =>
          (i + 1).toString()
        );
        const dailyOrderArray = daysInMonth.map((day) => ({
          name: `Day ${day}`,
          orders: dailyData.orders[day] || 0,
          fullfilled: dailyData.sales[day] || 0,
        }));

        setDailyOrderData(dailyOrderArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDataFromApi();
  }, []);

  const handleCardClick = (status) => {
    navigate("/order-details", { state: { orderStatus: status || "All" } });
  };

  const toggleCalendarVisibility = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {loading && <Loader open={loading} />}
        {!loading && (
          <>
            <Box
              sx={{
                my: 2,
                textAlign: "center",
                bgcolor: "#fff3cd",
                p: 1,
                borderRadius: 2,
                width: "100%",
              }}
            >
              <Typography variant="body1" color="textSecondary">
                You have <b>{pendingOrders}</b> pending orders
              </Typography>
            </Box>
            <Grid
              container
              spacing={2}
              sx={{ mb: 3, display: "flex", justifyContent: "space-around" }}
            >
              {[
                {
                  label: "Total Sales",
                  value: totalSales?.toFixed(2),
                  color: "#a5d6a7",
                  icon: (
                    <BsCurrencyDollar
                      style={{
                        fontSize: 40,
                        color: "white",
                        marginRight: 10,
                        marginLeft: 10,
                      }}
                    />
                  ),
                  // onClick: () => handleCardClick("TotalSales"),
                },
                {
                  label: "Total Orders",
                  value: totalOrders,
                  color: "#bbdefb",
                  icon: (
                    <SiVirustotal
                      style={{ fontSize: 50, color: "white", marginRight: 10 }}
                    />
                  ),
                  onClick: () => handleCardClick("All"),
                },
                {
                  label: "Pending Orders",
                  value: pendingOrders,
                  color: "#ffcc80",
                  icon: (
                    <AccessTime
                      style={{ fontSize: 50, color: "white", marginRight: 10 }}
                    />
                  ),
                  onClick: () => handleCardClick("Pending"),
                },
                {
                  label: "Dispatched Orders",
                  value: dispatchedOrders,
                  color: "#80deea",
                  icon: (
                    <CheckCircle
                      style={{ fontSize: 50, color: "white", marginRight: 10 }}
                    />
                  ),
                  onClick: () => handleCardClick("Dispatched"),
                },
                {
                  label: "Cancelled Orders",
                  value: cancelledOrders,
                  color: "#ef9a9a",
                  icon: (
                    <Cancel
                      style={{ fontSize: 50, color: "white", marginRight: 10 }}
                    />
                  ),
                  onClick: () => handleCardClick("Cancelled"),
                },
                {
                  label: "Fulfilled Orders",
                  value: fullfilledOrders,
                  color: "#a5d6a7",
                  icon: (
                    <AiOutlineFileDone
                      style={{ fontSize: 50, color: "white", marginRight: 10 }}
                    />
                  ),
                  onClick: () => handleCardClick("Fullfilled"),
                },
              ].map((card, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      backgroundColor: card.color,
                      cursor: "pointer",
                      height: "100px",
                      boxShadow: 3,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: card.color,
                        boxShadow: 6,
                      },
                    }}
                    onClick={card.onClick}
                  >
                    {card.icon}
                    <CardContent>
                      <Typography variant="body1" color="text.secondary">
                        {card.label}
                      </Typography>
                      <Typography variant="h6" color="text.primary">
                        {card.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>

            <Grid container spacing={5}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" align="center" gutterBottom>
                Total and Fullfilled Orders of {new Date().toLocaleString('default', { month: 'long' })}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dailyOrderData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Line
                      type="monotone"
                      dataKey="fullfilled"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="h6" align="center" gutterBottom>
                  Orders Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={barChartData}
                    margin={{
                      top: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    {/* <Legend /> */}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>

              <Grid
                item
                xs={12}
                md={12}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexDirection: "column",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={toggleCalendarVisibility}
                  sx={{ mb: 2 }}
                >
                  {showCalendar ? "Hide Calendar" : "Show Calendar"}
                </Button>
                {showCalendar && <FullCalendarComponent orders={orders} />}
              </Grid>
            </Grid>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;