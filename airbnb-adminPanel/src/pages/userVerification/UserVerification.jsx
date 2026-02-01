import React, { useEffect, useState } from "react";
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TablePagination,
    Modal,
    Switch,
    Chip
} from "@mui/material";
import {
    fetchData,
    updateDataById,
} from "../../config/apiServices/apiServices";
import { showErrorToast, showSuccessToast } from "../../components/toast/toast";
import Loader from "../../components/loader/loader";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";

const UserVerification = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openImage, setOpenImage] = useState(null);

    const handleOpenImage = (image) => setOpenImage(image);
    const handleCloseImage = () => setOpenImage(null);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await fetchData("get-users-verification");
            if (response && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            setError(error.message);
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleVerifyEmail = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await updateDataById("verify-email", id, { isVerified: newStatus });
            showSuccessToast(`Email verification ${newStatus ? 'enabled' : 'disabled'}`);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isEmailVerified: newStatus } : u));
        } catch (error) {
            console.error(error);
            showErrorToast("Failed to update email verification");
        }
    };

    const handleVerifyCNIC = async (id) => {
        // This endpoint only sets to TRUE.
        try {
            await updateDataById("verify-cnic", id, {});
            showSuccessToast("CNIC Verified");
            setUsers(prev => prev.map(u => u._id === id ? { ...u, CNIC: { ...u.CNIC, isVerified: true } } : u));
        } catch (error) {
            console.error(error);
            showErrorToast("Failed to verify CNIC");
        }
    };

    const paginatedData = users?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            {loading && <Loader open={loading} />}
            {error && <Typography color="error">{error}</Typography>}

            {!loading && !error && (
                <>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>User Verification Management</Typography>

                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell fontWeight={800}>User</TableCell>
                                    <TableCell>Email Status</TableCell>
                                    <TableCell>CNIC Status</TableCell>
                                    <TableCell>CNIC Documents</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedData?.map((user) => (
                                    <TableRow key={user._id} hover>
                                        {/* User Info */}
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Box
                                                    component="img"
                                                    src={user.photoProfile || "/default-profile.png"}
                                                    alt={user.userName}
                                                    sx={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                                                    onError={(e) => (e.target.src = "/default-profile.png")}
                                                />
                                                <Box>
                                                    <Typography fontWeight={700} variant="body2">{user.userName || "No Name"}</Typography>
                                                    <Typography variant="caption" color="var(--text-secondary)">{user.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {/* Email Status */}
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Switch
                                                    checked={!!user.isEmailVerified}
                                                    onChange={() => handleVerifyEmail(user._id, user.isEmailVerified)}
                                                    size="small"
                                                />
                                                {user.isEmailVerified ?
                                                    <Chip icon={<CheckCircleIcon />} label="Verified" color="success" size="small" variant="outlined" /> :
                                                    <Chip icon={<CancelIcon />} label="Unverified" color="default" size="small" variant="outlined" />
                                                }
                                            </Box>
                                        </TableCell>

                                        {/* CNIC Status */}
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {user.CNIC?.isVerified ? (
                                                    <Chip icon={<CheckCircleIcon />} label="Verified" color="success" size="small" />
                                                ) : (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleVerifyCNIC(user._id)}
                                                        color="warning"
                                                        disabled={!user.CNIC?.images || user.CNIC.images.length < 2}
                                                    >
                                                        Verify Now
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>

                                        {/* CNIC Docs */}
                                        <TableCell>
                                            {user.CNIC?.images && user.CNIC.images.length > 0 ? (
                                                <Box display="flex" gap={1}>
                                                    {user.CNIC.images.slice(0, 2).map((img, idx) => (
                                                        <Box
                                                            key={idx}
                                                            component="img"
                                                            src={img}
                                                            sx={{ width: 40, height: 30, objectFit: "cover", borderRadius: 1, cursor: "pointer", border: "1px solid #ddd" }}
                                                            onClick={() => handleOpenImage(img)}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="var(--text-secondary)">No Docs</Typography>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={users?.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>

                    <Modal
                        open={openImage !== null}
                        onClose={handleCloseImage}
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "rgba(0,0,0,0.8)"
                        }}
                    >
                        <Box
                            component="img"
                            src={openImage}
                            alt="Doc"
                            sx={{
                                maxWidth: "90%",
                                maxHeight: "90%",
                                objectFit: "contain",
                            }}
                        />
                    </Modal>
                </>
            )}
        </>
    );
};

export default UserVerification;
