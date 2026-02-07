import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGuestProfile } from '../../services/profileService';
import { FaShieldAlt, FaHome, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import '../../styles/profile.css';
import { Avatar, Skeleton, Stack } from '@mui/material';

const GuestProfile = () => {
    const { guestId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getGuestProfile(guestId);
                setProfile(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [guestId]);

    if (loading) {
        return (
            <div className="profile-page-container">
                <Skeleton variant="rectangular" height={400} className="profile-card" />
                <Stack spacing={2}>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="rectangular" height={200} />
                </Stack>
            </div>
        );
    }

    if (error || !profile) {
        return <div className="profile-page-container"><h2>Guest not found</h2></div>;
    }

    return (
        <div className="profile-page-container">
            {/* Left Sidebar */}
            <aside className="profile-card">
                <div className="profile-avatar-wrapper">
                    <Avatar
                        src={profile.photoProfile}
                        sx={{ width: 128, height: 128, margin: '0 auto' }}
                        alt={profile.userName}
                    />
                    {profile.isVerified && (
                        <FaShieldAlt className="verified-icon" style={{ position: 'absolute', bottom: 0, right: 0, fontSize: '24px', background: 'white', borderRadius: '50%' }} />
                    )}
                </div>
                <h1 className="profile-name">{profile.userName}</h1>
                <p className="profile-joined">Joined in {new Date(profile.joinedDate).getFullYear()}</p>

                <div className="verification-badges">
                    {profile.isVerified && (
                        <div className="badge-item">
                            <FaCheckCircle color="#ff385c" /> Identity Verified
                        </div>
                    )}
                    <div className="badge-item">
                        <FaEnvelope /> Email Confirmed
                    </div>
                </div>

                <div className="stats-grid" style={{ borderTop: 'none', borderBottom: 'none', flexDirection: 'column', display: 'flex', gap: '12px' }}>
                    <div className="stat-item">
                        <span className="stat-value">{profile.stats.totalTrips}</span>
                        <span className="stat-label">Trips</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{profile.reviews.length}</span>
                        <span className="stat-label">Reviews</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="profile-content">
                <section>
                    <h2 className="section-title">About {profile.userName}</h2>
                    <p className="bio-text">{profile.bio}</p>
                </section>

                {/* Reviews Section */}
                {profile.reviews && profile.reviews.length > 0 ? (
                    <section>
                        <h2 className="section-title">Reviews from Hosts ({profile.reviews.length})</h2>
                        <div className="listings-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            {profile.reviews.map(review => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <Avatar src={review.host.photoProfile} alt={review.host.userName} className="reviewer-avatar" />
                                        <div className="reviewer-info">
                                            <h4>{review.host.userName}</h4>
                                            <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="review-text">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section>
                        <h2 className="section-title">No reviews yet</h2>
                        <p className="bio-text">This guest has no public reviews from hosts yet.</p>
                    </section>
                )}
            </main>
        </div>
    );
};

export default GuestProfile;
