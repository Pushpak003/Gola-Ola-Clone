import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-screen w-screen bg-cover bg-center" style={{ backgroundImage: "url('/your-bg-image.jpg')" }}>
            {/* ... Baki aapka purana HTML/CSS text ... */}
            
            <div className="p-6 space-y-4">
                {/* Book a Ride Button */}
                <button 
                    onClick={() => navigate('/login')} 
                    className="w-full max-w-md bg-black text-white py-3 rounded-lg font-semibold block text-center hover:bg-gray-900 transition"
                >
                    Book a Ride 📱
                </button>

                {/* Drive with Gola Button */}
                <button 
                    onClick={() => navigate('/captain/login')} 
                    className="w-full max-w-md bg-white text-black border border-gray-300 py-3 rounded-lg font-semibold block text-center hover:bg-gray-100 transition"
                >
                    Drive with Gola 🏍️
                </button>
            </div>
        </div>
    );
};

export default Landing;