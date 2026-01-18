import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../assets/styles/mainScreen.css";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/mainScreen.css"

const FullCalendarComponent = ({ orders }) => {
  const navigate = useNavigate();
  const orderCountByDate = {};

  orders.forEach((order) => {
    const orderDate = new Date(order.orderDate).toISOString().split('T')[0]; 
    orderCountByDate[orderDate] = (orderCountByDate[orderDate] || 0) + 1; 
  });

  const events = Object.keys(orderCountByDate).map((date) => ({
    title: `Orders: ${orderCountByDate[date]}`,
    start: date, 
    end: date,
    extendedProps: { orderDate: date }   
  }));

  const handleEventClick = (clickInfo) => {
    const selectedDateByCalendar = clickInfo.event.extendedProps.orderDate;
    navigate("/order-details", { state: { selectedDateByCalendar, fromDashboard: true } });
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={false}
        selectable={true}
        eventClick={handleEventClick}
      />
    </div>
  );
};

export default FullCalendarComponent;
