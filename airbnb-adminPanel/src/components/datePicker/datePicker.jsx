import React, { useContext, useState } from "react";
import { Grid, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SearchContext } from "../../context/context";
import dayjs from "dayjs";

const DatePickerComp = () => {
  const { selectedDate, setSelectedDate } = useContext(SearchContext);
  const [dateError, setDateError] = useState("");

  const handleDateChange = (newValue) => {
    if (newValue) {
      setSelectedDate(newValue);
      setDateError("");
    } else {
      setDateError("Please select a date");
    }
  };

  return (
    <Grid item xs={12} sm={12} md={12}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="mm/dd/yyyy"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              helperText={dateError}
              error={!!dateError}
            />
          )}
        />
      </LocalizationProvider>
    </Grid>
  );
};

export default DatePickerComp;
