import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const Back = () => {
    let navigate = useNavigate()
  return (
    <div onClick={()=>navigate(-1)}>
      <ArrowBackIcon sx={{ color: '#313131', fontSize: "30px", marginTop: "10px", cursor: "pointer" }}/>
    </div>
  )
}

export default Back
