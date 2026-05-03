import React, { useEffect, useMemo, useState } from "react";
import { getAuthToken } from "../../utils/cookieUtils";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { API_BASE_URL, CURRENCY } from "../../config/env";

import {
    Row,
    Col,
    Card,
    Typography,
    Space,
    Button,
    Tag,
    Table,
    Avatar,
    Divider,
    Tooltip,
    Empty,
    Spin,
    Select,
    DatePicker,
    Segmented,
    Statistic,
    theme,
} from "antd";
import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../../components/language/Localization";

import {
    ReloadOutlined,
    FilterOutlined,
    DollarOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import apiClient from "../../config/ServiceApi/apiClient";
import usePageTitle from "../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const money = (val) => `${CURRENCY} ${Number(val || 0).toLocaleString()}`;

const pageShell = {
    minHeight: "100vh",
    padding: "24px",
    background: "var(--bg-primary)",
};

const glassCard = {
    borderRadius: 16,
    border: "1px solid var(--border-light)",
    boxShadow: "var(--shadow-md)",
    background: "var(--bg-card)",
    backdropFilter: "blur(10px)",
};

const softHover = {
    transition: "all .2s ease",
};


const HostDashboardAntd = () => {
    const { t } = useTranslation("translation");
    usePageTitle(t("hosting.dashboard.title"));
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const [tab, setTab] = useState("pending");

    const [filters, setFilters] = useState({
        range: null,
        status: "",
    });

    const token = getAuthToken();

    const isRTL = useRTL();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const params = {};
            if (filters.range?.length === 2) {
                params.from = dayjs(filters.range[0]).toISOString();
                params.to = dayjs(filters.range[1]).toISOString();
            }
            if (filters.status) params.status = filters.status;

            const response = await apiClient.get(`${API_BASE_URL}/api/host/dashboard/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            setData(response.data);
        } catch (err) {
            console.error(err);
            toast.error(t("hosting.settings.loadError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line
    }, []);

    const handleReset = () => {
        setFilters({ range: null, status: "" });
    };

    const handleAction = async (action, bookingId) => {
        try {
            if (action === "approve") {
                await apiClient.post(
                    `${API_BASE_URL}/approve-booking/${bookingId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success(t("hosting.dashboard.bookingApproved"));
            } else {
                await apiClient.delete(`${API_BASE_URL}/reject-booking/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success(t("hosting.dashboard.bookingRejected"));
            }
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            toast.error(t("hosting.dashboard.actionFailed", { action }));
        }
    };

    const revenueRows = useMemo(() => data?.charts?.revenueByDate || [], [data]);
    const topListings = useMemo(() => data?.lists?.topListings || [], [data]);

    const revenueColumns = [
        {
            title: t("hosting.dashboard.date"),
            dataIndex: "date",
            key: "date",
            render: (d) => <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>{dayjs(d).format("MMM D, YYYY")}</Text>,
        },
        {
            title: t("hosting.dashboard.gross"),
            dataIndex: "gross",
            key: "gross",
            align: isRTL ? "left" : "right",
            render: (v) => <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>{money(v)}</Text>,
        },
        {
            title: t("hosting.dashboard.fee"),
            dataIndex: "fee",
            key: "fee",
            align: isRTL ? "left" : "right",
            render: (v) => <Text style={{ fontWeight: 700, color: "#cf1322" }}>- {money(v)}</Text>,
        },
        {
            title: t("hosting.dashboard.net"),
            dataIndex: "net",
            key: "net",
            align: isRTL ? "left" : "right",
            render: (v) => <Text style={{ fontWeight: 800, color: "#237804" }}>{money(v)}</Text>,
        },
        {
            title: t("hosting.dashboard.bookings"),
            dataIndex: "bookings",
            key: "bookings",
            align: isRTL ? "left" : "right",
            render: (v) => <Text style={{ fontWeight: 800, color: "var(--text-primary)" }}>{v}</Text>,
        },
    ];

    const activeColumns = [
        {
            title: t("hosting.dashboard.guest"),
            key: "guest",
            render: (_, booking) => (
                <Space>
                    <Avatar src={booking.userId?.photoProfile || ""}>
                        {(booking.userId?.userName || "U")?.[0]}
                    </Avatar>
                    <Text style={{ fontWeight: 800 }}>{booking.userId?.userName || "User"}</Text>
                </Space>
            ),
        },
        {
            title: t("hosting.dashboard.listing"),
            key: "listing",
            render: (_, booking) => (
                <Text style={{ fontWeight: 800 }}>{booking.listingId?.title || "-"}</Text>
            ),
        },
        {
            title: t("hosting.dashboard.dates"),
            key: "dates",
            render: (_, booking) => {
                const nights = dayjs(booking.endDate).diff(dayjs(booking.startDate), "day");
                return (
                    <Space direction="vertical" size={0}>
                        <Text style={{ fontWeight: 800 }}>
                            {dayjs(booking.startDate).format("MMM D")} - {dayjs(booking.endDate).format("MMM D")}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t("hosting.dashboard.nights", { count: nights })}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: t("hosting.dashboard.price"),
            key: "price",
            align: isRTL ? "left" : "right",
            render: (_, booking) => <Text style={{ fontWeight: 900 }}>{money(booking.totalPrice)}</Text>,
        },
        {
            title: t("hosting.dashboard.status"),
            key: "status",
            align: isRTL ? "left" : "right",
            render: (_, booking) => {
                const isUpcoming = new Date(booking.startDate) > new Date();
                return (
                    <Tag
                        color={isUpcoming ? "blue" : "green"}
                        style={{ fontWeight: 800, borderRadius: 999, padding: "4px 10px" }}
                    >
                        {isUpcoming ? t("hosting.dashboard.upcoming") : t("hosting.dashboard.activePast")}
                    </Tag>
                );
            },
        },
    ];

    if (loading && !data) {
        return (
            <div style={{ ...pageShell, display: "grid", placeItems: "center" }}>
                <Space direction="vertical" align="center" size={12}>
                    <Spin size="large" />
                    <Text type="secondary" style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
                        {t("hosting.dashboard.loading")}
                    </Text>
                </Space>
            </div>
        );
    }

    return (
        <RTLWrapper sx={{ ...pageShell, textAlign: 'inherit' }}>
            <div style={{ maxWidth: 1600, margin: "0 auto" }}>
                {/* Header */}
                <Card style={{ ...glassCard, marginBottom: 18 }}>
                    <Row align="middle" justify="space-between" gutter={[16, 16]}>
                        <Col>
                            <Space size={12} align="start">
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 14,
                                        display: "grid",
                                        placeItems: "center",
                                        background: "var(--color-blue)",
                                        border: "1px solid rgba(22, 119, 255, 0.20)",
                                    }}
                                >
                                    <HomeOutlined style={{ fontSize: 18, color: "var(--text-primary)" }} />
                                </div>

                                <div>
                                    <Title level={3} style={{ margin: 0, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--color-blue)" }}>
                                        {t("hosting.dashboard.title")}
                                    </Title>
                                    <Text type="secondary" style={{ fontWeight: 650, color: "var(--text-primary)" }}>
                                        {t("hosting.dashboard.desc")}
                                    </Text>
                                </div>
                            </Space>
                        </Col>

                        <Col>
                            <Space>
                                <Tooltip title={t("hosting.dashboard.refresh")}>
                                    <Button
                                        icon={<ReloadOutlined style={{ color: "var(--text-secondary)" }} />}
                                        onClick={fetchDashboardData}
                                        style={{ borderRadius: 12, fontWeight: 800 }}
                                    >
                                        {t("hosting.dashboard.refresh")}
                                    </Button>
                                </Tooltip>

                                <Button
                                    type="primary"
                                    icon={<FilterOutlined />}
                                    onClick={fetchDashboardData}
                                    style={{
                                        borderRadius: 12,
                                        fontWeight: 900,
                                        boxShadow: "0 14px 28px rgba(0,0,0,0.14)",
                                    }}
                                >
                                    {t("hosting.dashboard.applyFilters")}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Filters */}
                <Card
                    style={{ ...glassCard, marginBottom: 18 }}
                    bodyStyle={{ padding: 16 }}
                >
                    <Row gutter={[12, 12]} align="middle" justify="space-between">
                        {/* Left Title */}
                        <Col xs={24} lg={6}>
                            <Space size={10}>
                                <div
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 12,
                                        display: "grid",
                                        placeItems: "center",
                                        background: "rgba(22, 119, 255, 0.10)",
                                        border: "1px solid rgba(22, 119, 255, 0.20)",
                                    }}
                                >
                                    <FilterOutlined style={{ color: "var(--color-blue)" }} />
                                </div>

                                <Space direction="vertical" size={0}>
                                    <Text style={{ fontWeight: 950, fontSize: 16, color: "var(--text-primary)" }}>{t("hosting.dashboard.filters")}</Text>
                                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 650, color: "var(--text-secondary)" }}>
                                        {t("hosting.dashboard.filtersDesc")}
                                    </Text>
                                </Space>
                            </Space>
                        </Col>

                        {/* Middle Controls */}
                        <Col xs={24} lg={14}>
                            <Row gutter={[10, 10]} align="middle">
                                <Col xs={24} md={12}>
                                    <RangePicker
                                        value={filters.range}
                                        onChange={(val) => setFilters((p) => ({ ...p, range: val }))}
                                        style={{
                                            width: "100%",
                                            borderRadius: 12,
                                            height: 40,
                                            fontWeight: 700,
                                        }}
                                        allowClear
                                        presets={[
                                            {
                                                label: t("hosting.dashboard.todayPreset"),
                                                value: [dayjs().startOf("day"), dayjs().endOf("day")],
                                            },
                                            {
                                                label: t("hosting.dashboard.last7Days"),
                                                value: [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")],
                                            },
                                            {
                                                label: t("hosting.dashboard.last30Days"),
                                                value: [dayjs().subtract(29, "day").startOf("day"), dayjs().endOf("day")],
                                            },
                                        ]}
                                    />
                                </Col>

                                <Col xs={24} md={12}>
                                    <Select
                                        value={filters.status}
                                        onChange={(val) => setFilters((p) => ({ ...p, status: val }))}
                                        style={{ width: "100%" }}
                                        size="middle"
                                        placeholder={t("hosting.dashboard.allStatus")}
                                        options={[
                                            { value: "", label: t("hosting.dashboard.allStatus") },
                                            { value: "confirmed", label: t("hosting.dashboard.confirmed") },
                                            { value: "pending", label: t("hosting.dashboard.pending") },
                                            { value: "upcoming", label: t("hosting.dashboard.upcoming") },
                                        ]}
                                    />
                                </Col>

                                {/* Active filter summary */}
                                <Col xs={24}>
                                    <Space size={8} wrap>
                                        {(filters.range || filters.status) ? (
                                            <Tag
                                                color="blue"
                                                style={{
                                                    borderRadius: 999,
                                                    padding: "4px 10px",
                                                    fontWeight: 850,
                                                }}
                                            >
                                                {t("hosting.dashboard.activeFilters")}
                                            </Tag>
                                        ) : (
                                            <Tag
                                                style={{
                                                    borderRadius: 999,
                                                    padding: "4px 10px",
                                                    fontWeight: 800,
                                                    color: "var(--text-primary)",
                                                    backgroundColor: "var(--bg-secondary)",
                                                }}
                                            >
                                                {t("hosting.dashboard.noFilters")}
                                            </Tag>
                                        )}

                                        {filters.range?.length === 2 && (
                                            <Tag style={{ borderRadius: 999, padding: "4px 10px", fontWeight: 800 }}>
                                                {dayjs(filters.range[0]).format("MMM D")} → {dayjs(filters.range[1]).format("MMM D")}
                                            </Tag>
                                        )}

                                        {filters.status && (
                                            <Tag style={{ borderRadius: 999, padding: "4px 10px", fontWeight: 800 }}>
                                                {t("hosting.dashboard.statusLabel", { status: filters.status })}
                                            </Tag>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        </Col>

                        {/* Right Actions */}
                        <Col xs={24} lg={4}>
                            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                                <Button
                                    onClick={handleReset}
                                    style={{
                                        borderRadius: 12,
                                        fontWeight: 900,
                                        height: 40,
                                        color: "var(--text-primary)",
                                        backgroundColor: "var(--bg-secondary)",
                                    }}
                                >
                                    {t("hosting.dashboard.reset")}
                                </Button>

                                <Button
                                    type="primary"
                                    onClick={fetchDashboardData}
                                    style={{
                                        borderRadius: 12,
                                        fontWeight: 900,
                                        height: 40,
                                        boxShadow: "0 12px 24px rgba(22, 119, 255, 0.22)",
                                    }}
                                >
                                    {t("hosting.dashboard.apply")}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>


                {/* KPI Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
                    {[
                        {
                            title: t("hosting.dashboard.totalBookings"),
                            value: data?.kpis?.totalBookings || 0,
                            icon: <CheckCircleOutlined style={{ color: "#1677ff" }} />,
                            meta: t("hosting.dashboard.allTime"),
                        },
                        {
                            title: t("hosting.dashboard.pendingRequests"),
                            value: data?.kpis?.pendingRequests || 0,
                            icon: <ClockCircleOutlined style={{ color: "#faad14" }} />,
                            meta: t("hosting.dashboard.needsApproval"),
                        },
                        {
                            title: t("hosting.dashboard.upcomingBookings"),
                            value: data?.kpis?.upcomingBookings || 0,
                            icon: <CalendarOutlined style={{ color: "#1677ff" }} />,
                            meta: t("hosting.dashboard.futureStays"),
                        },
                        {
                            title: t("hosting.dashboard.netEarnings"),
                            value: money(data?.kpis?.hostNetEarnings || 0),
                            icon: <DollarOutlined style={{ color: "#52c41a" }} />,
                            meta: t("hosting.dashboard.afterFee"),
                        },
                    ].map((kpi, idx) => (
                        <Col key={idx} xs={24} sm={12} lg={6}>
                            <Card
                                style={{
                                    ...glassCard,
                                    borderRadius: 18,
                                    overflow: "hidden",
                                }}
                                bodyStyle={{ padding: 16 }}
                                hoverable
                            >
                                <Row align="middle" justify="space-between">
                                    <Col>
                                        <Space direction="vertical" size={2}>
                                            <Text type="secondary" style={{ fontWeight: 800, fontSize: 12, color: "var(--text-secondary)" }}>
                                                {kpi.title}
                                            </Text>

                                            <Text style={{ fontWeight: 950, fontSize: 26, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
                                                {kpi.value}
                                            </Text>

                                            <Text type="secondary" style={{ fontWeight: 650, fontSize: 12, color: "var(--text-secondary)" }}>
                                                {kpi.meta}
                                            </Text>
                                        </Space>
                                    </Col>

                                    <Col>
                                        <div
                                            style={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: 16,
                                                display: "grid",
                                                placeItems: "center",
                                                background: "rgba(15, 23, 42, 0.04)",
                                                border: "1px solid rgba(15, 23, 42, 0.06)",
                                            }}
                                        >
                                            <span style={{ fontSize: 18 }}>{kpi.icon}</span>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>


                {/* Revenue + Top Listings */}
                <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
                    <Col xs={24} lg={16}>
                        <Card style={glassCard} title={<Text style={{ fontWeight: 950, color: "var(--text-primary)" }}>{t("hosting.dashboard.revenueBreakdown")}</Text>}>
                            <Space style={{ marginBottom: 12 }}>
                                <Tag
                                    color="blue"
                                    style={{ borderRadius: 999, padding: "4px 10px", fontWeight: 900 }}
                                >
                                    {t("hosting.dashboard.avgBooking", { value: money(Math.round(data?.kpis?.avgBookingValue || 0)) })}
                                </Tag>
                            </Space>

                            <Table
                                size="middle"
                                bordered={false}
                                columns={revenueColumns}

                                dataSource={revenueRows.map((r, i) => ({ ...r, key: r.date || i }))}
                                pagination={{ pageSize: 6 }}
                                style={{ borderRadius: 14, overflow: "hidden" }}
                                locale={{
                                    emptyText: <Empty description={t("hosting.dashboard.noRevenue")} />,
                                }}
                            />


                            <Divider />

                            <Row gutter={[16, 12]} justify="end">
                                <Col>
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{t("hosting.dashboard.totalGross")}</Text>
                                        <Text style={{ fontWeight: 950, fontSize: 16, color: "var(--text-primary)" }}>
                                            {money(data?.kpis?.totalGross)}
                                        </Text>
                                    </Space>
                                </Col>

                                <Col>
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{t("hosting.dashboard.totalFees")}</Text>
                                        <Text style={{ fontWeight: 950, fontSize: 16, color: "#cf1322" }}>
                                            {money(data?.kpis?.platformFeeTotal)}
                                        </Text>
                                    </Space>
                                </Col>

                                <Col>
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{t("hosting.dashboard.netIncome")}</Text>
                                        <Text style={{ fontWeight: 950, fontSize: 16, color: "#237804" }}>
                                            {money(data?.kpis?.hostNetEarnings)}
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card style={glassCard} title={<Text style={{ fontWeight: 950, color: "var(--text-primary)" }}>{t("hosting.dashboard.topListings")}</Text>}>
                            <Table
                                size="middle"
                                pagination={false}
                                columns={[
                                    {
                                        title: t("hosting.listings.title"),
                                        key: "listing",
                                        render: (_, listing) => (
                                            <Space>
                                                <Avatar shape="square" size={42} src={listing.photo || ""}>
                                                    {(listing.title || "L")[0]}
                                                </Avatar>
                                                <Space direction="vertical" size={0}>
                                                    <Text style={{ fontWeight: 900, color: "var(--text-primary)" }}>{listing.title}</Text>
                                                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 650, color: "var(--text-secondary)" }}>
                                                        {t("hosting.dashboard.bookingsCount", { count: listing.bookingCount })}
                                                    </Text>
                                                </Space>
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: t("hosting.dashboard.earnings"),
                                        key: "earnings",
                                        align: "right",
                                        render: (_, listing) => (
                                            <Text style={{ fontWeight: 950, color: "var(--text-primary)" }}>{money(listing.grossEarnings)}</Text>
                                        ),
                                    },
                                ]}
                                dataSource={topListings.map((l, i) => ({ ...l, key: l._id || i }))}
                                locale={{ emptyText: <Empty description={t("hosting.dashboard.noData")} /> }}
                            />
                        </Card>
                    </Col>
                </Row>

            </div>
        </RTLWrapper>
    );
};

export default HostDashboardAntd;
