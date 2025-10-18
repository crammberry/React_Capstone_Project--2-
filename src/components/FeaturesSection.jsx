import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🗺️',
      title: 'Precise Lot Mapping',
      description: 'Our system provides an accurate digital representation of all burial plots in the memorial park, making it easy to locate specific gravesites.'
    },
    {
      icon: '🗄️',
      title: 'Comprehensive Records',
      description: 'Detailed information about each interment is securely stored and easily accessible to authorized personnel through our admin system.'
    },
    {
      icon: '👤⚙️',
      title: 'Admin Management',
      description: 'Authorized administrators can update burial records, mark plots as occupied, and maintain accurate records of all interments.'
    }
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl text-[#2C3E50] font-bold leading-tight mb-6">
            About Our Digital Mapping System
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Icon Container */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#3498DB] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">{feature.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;