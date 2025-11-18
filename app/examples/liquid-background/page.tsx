'use client';

import React from 'react';
import LiquidEther from '../../../components/LiquidEther';

export default function LiquidBackgroundExample() {
  return (
    <div className="min-h-screen relative">
      {/* LiquidEther as background */}
      <div className="liquid-ether-background">
        <LiquidEther 
          mouseForce={15}
          cursorSize={120}
          isViscous={true}
          viscous={25}
          colors={['#3b82f6', '#8b5cf6', '#ec4899']}
          autoDemo={true}
          autoIntensity={2.0}
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Interactive Fluid Background</h1>
          <p className="text-lg text-gray-700 mb-4">
            This page demonstrates the LiquidEther component as an interactive background.
            Move your mouse around to interact with the fluid simulation.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            The component uses Three.js to create a beautiful fluid simulation that responds
            to user interaction, creating an engaging and modern UI experience.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2 text-blue-800">Implementation Details</h2>
            <p className="text-gray-700">
              The LiquidEther component is added with the "liquid-ether-background" class
              to position it fixed behind all content. The content container uses relative
              positioning with z-index to appear above the background.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}