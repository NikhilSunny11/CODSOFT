require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Find an employer to be the author of the jobs
    let employer = await User.findOne({ role: 'employer' });
    if (!employer) {
      employer = await User.create({
        name: 'Tech Corp',
        email: 'msdkomban2@gmail.com',
        password: 'password123',
        role: 'employer',
        company: 'Tech Corp Inc.',
      });
      console.log('Created a dummy employer');
    }

    const jobs = [
      {
        title: 'Senior Frontend Engineer',
        description: 'We are looking for an experienced frontend engineer with strong React and Next.js skills to lead our core product development.',
        company: 'InnovateTech',
        location: 'Remote',
        salary: { min: 1000000, max: 2000000, currency: 'INR' },
        type: 'full-time',
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
        postedBy: employer._id,
      },
      {
        title: 'Backend Developer (Node.js)',
        description: 'Join our backend team to build scalable microservices using Node.js, Express, and MongoDB.',
        company: 'CloudSys',
        location: 'Bangalore, India',
        salary: { min: 800000, max: 1500000, currency: 'INR' },
        type: 'full-time',
        skills: ['Node.js', 'Express', 'MongoDB', 'Redis'],
        postedBy: employer._id,
      },
      {
        title: 'Product Manager',
        description: 'Looking for a data-driven Product Manager to oversee the lifecycle of our flagship SaaS platform.',
        company: 'SaaSify',
        location: 'Remote',
        salary: { min: 1200000, max: 2500000, currency: 'INR' },
        type: 'full-time',
        skills: ['Product Management', 'Agile', 'Jira', 'Data Analysis'],
        postedBy: employer._id,
      },
      {
        title: 'UI/UX Designer',
        description: 'We need a creative UI/UX designer to craft beautiful user experiences for our upcoming mobile and web applications.',
        company: 'DesignStudio',
        location: 'Mumbai, India',
        salary: { min: 600000, max: 1200000, currency: 'INR' },
        type: 'full-time',
        skills: ['Figma', 'UI Design', 'Prototyping', 'User Research'],
        postedBy: employer._id,
      },
      {
        title: 'DevOps Engineer',
        description: 'Seeking a DevOps expert to manage our AWS infrastructure, CI/CD pipelines, and Kubernetes clusters.',
        company: 'Infrastructure Inc',
        location: 'Pune, India',
        salary: { min: 1500000, max: 2500000, currency: 'INR' },
        type: 'full-time',
        skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
        postedBy: employer._id,
      },
      {
        title: 'Data Scientist',
        description: 'Join our AI team to develop predictive models and derive insights from massive datasets.',
        company: 'DataMinds',
        location: 'Hyderabad, India',
        salary: { min: 1400000, max: 2800000, currency: 'INR' },
        type: 'full-time',
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        postedBy: employer._id,
      }
    ];

    await Job.insertMany(jobs);
    console.log('Jobs seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs();
