import React, { useState, useMemo } from 'react';
import ProfileCard from '../components/ProfileCard';
import './ViewProfile.css';
import Dock from '../react-bits/Dock';
import { useNavigate } from "react-router-dom";

const ViewProfile = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for multiple profiles with more variety for better search testing
  const profiles = [
  {
    name: "John Doe",
    currentRole: "Senior Software Engineer",
    currentCompany: "Google",
    previousCompany: "Microsoft",
    education: "MIT Computer Science",
    yearsExperience: 5,
    skills: ["React", "Node.js", "Python", "AWS", "MongoDB"],
    rating: 4.9,
    interviewsCompleted: 45,
    successRate: "92%",
    profileImage: "./profilepic1.png"
  },
  {
    name: "Sarah Chen",
    currentRole: "Product Manager",
    currentCompany: "Apple",
    previousCompany: "Facebook",
    education: "Stanford MBA",
    yearsExperience: 7,
    skills: ["Product Strategy", "Agile", "Data Analysis", "User Research", "SQL"],
    rating: 4.8,
    interviewsCompleted: 38,
    successRate: "89%",
    profileImage: "./profilepic2.png"
  },
  {
    name: "Michael Rodriguez",
    currentRole: "DevOps Engineer",
    currentCompany: "Amazon",
    education: "UC Berkeley Computer Engineering",
    yearsExperience: 4,
    skills: ["Docker", "Kubernetes", "Terraform", "Jenkins", "Linux"],
    rating: 4.7,
    interviewsCompleted: 28,
    successRate: "85%",
    profileImage: "./profilepic3.png"
  },
  {
    name: "Emily Watson",
    currentRole: "UX Designer",
    currentCompany: "Netflix",
    previousCompany: "Airbnb",
    education: "RISD Design",
    yearsExperience: 6,
    skills: ["Figma", "User Testing", "Prototyping", "Design Systems", "Adobe Creative Suite"],
    rating: 4.9,
    interviewsCompleted: 52,
    successRate: "94%",
    profileImage: "./profilepic4.png"
  },
  {
    name: "David Kim",
    currentRole: "Data Scientist",
    currentCompany: "Spotify",
    previousCompany: "Uber",
    education: "Carnegie Mellon Statistics",
    yearsExperience: 3,
    skills: ["Python", "R", "Machine Learning", "TensorFlow", "Tableau"],
    rating: 4.6,
    interviewsCompleted: 33,
    successRate: "87%",
    profileImage: "./profilepic5.png"
  },
  {
    name: "Jessica Taylor",
    currentRole: "Frontend Developer",
    currentCompany: "Shopify",
    education: "Georgia Tech Computer Science",
    yearsExperience: 2,
    skills: ["Vue.js", "TypeScript", "CSS", "Jest", "Webpack"],
    rating: 4.5,
    interviewsCompleted: 19,
    successRate: "82%",
    profileImage: "./profilepic6.png"
  },
  {
    name: "Alex Johnson",
    education: "Self-taught",
    yearsExperience: 1,
    skills: ["HTML", "CSS", "JavaScript"],
    rating: 4.2,
    interviewsCompleted: 12,
    successRate: "75%",
    profileImage: "./profilepic7.png"
  },
  {
    name: "Rachel Green",
    currentRole: "Backend Developer",
    currentCompany: "Slack",
    previousCompany: "Dropbox",
    education: "University of Washington Computer Science",
    yearsExperience: 4,
    skills: ["Java", "Spring Boot", "PostgreSQL", "Redis", "Microservices"],
    rating: 4.8,
    interviewsCompleted: 41,
    successRate: "90%",
    profileImage: "./profilepic8.png"
  },
  {
    name: "Marcus Thompson",
    currentRole: "Security Engineer",
    currentCompany: "Cloudflare",
    education: "MIT Cybersecurity",
    yearsExperience: 8,
    skills: ["Penetration Testing", "Network Security", "CISSP", "Python", "Wireshark"],
    rating: 4.9,
    interviewsCompleted: 67,
    successRate: "95%",
    profileImage: "./profilepic9.png"
  },
  {
    name: "Lisa Anderson",
    currentRole: "Mobile Developer",
    currentCompany: "Instagram",
    previousCompany: "Snapchat",
    education: "Stanford Computer Science",
    yearsExperience: 5,
    skills: ["Swift", "Kotlin", "React Native", "iOS", "Android"],
    rating: 4.7,
    interviewsCompleted: 36,
    successRate: "88%",
    profileImage: "./profilepic10.png"
  },
  {
    name: "James Wilson",
    currentRole: "Cloud Architect",
    currentCompany: "Microsoft Azure",
    previousCompany: "Oracle",
    education: "Caltech Computer Engineering",
    yearsExperience: 10,
    skills: ["Azure", "AWS", "Cloud Migration", "Architecture Design", "DevOps"],
    rating: 4.9,
    interviewsCompleted: 89,
    successRate: "96%",
    profileImage: "./profilepic11.png"
  },
  {
    name: "Amanda Foster",
    currentRole: "Machine Learning Engineer",
    currentCompany: "Tesla",
    education: "PhD in AI from Stanford",
    yearsExperience: 6,
    skills: ["PyTorch", "Computer Vision", "Deep Learning", "CUDA", "MLOps"],
    rating: 4.8,
    interviewsCompleted: 44,
    successRate: "91%",
    profileImage: "./profilepic12.png"
  },
  {
    name: "Chris Martinez",
    currentRole: "Full Stack Developer",
    currentCompany: "Stripe",
    previousCompany: "PayPal",
    education: "University of Texas Computer Science",
    yearsExperience: 4,
    skills: ["React", "Node.js", "GraphQL", "MongoDB", "Docker"],
    rating: 4.6,
    interviewsCompleted: 31,
    successRate: "84%",
    profileImage: "./profilepic13.png"
  },
  {
    name: "Sophia Lee",
    currentRole: "Product Designer",
    currentCompany: "Figma",
    education: "Art Center College of Design",
    yearsExperience: 3,
    skills: ["UI/UX Design", "Prototyping", "User Research", "Sketch", "InVision"],
    rating: 4.7,
    interviewsCompleted: 29,
    successRate: "86%",
    profileImage: "./profilepic14.png"
  },
  {
    name: "Ryan Parker",
    currentRole: "Site Reliability Engineer",
    currentCompany: "Google",
    previousCompany: "LinkedIn",
    education: "UC San Diego Computer Engineering",
    yearsExperience: 7,
    skills: ["Kubernetes", "Prometheus", "Go", "Monitoring", "Incident Response"],
    rating: 4.8,
    interviewsCompleted: 56,
    successRate: "93%",
    profileImage: "./profilepic15.png"
  },
  {
    name: "Nina Patel",
    currentRole: "QA Engineer",
    currentCompany: "Atlassian",
    education: "Indian Institute of Technology",
    yearsExperience: 5,
    skills: ["Selenium", "Test Automation", "JIRA", "Cypress", "API Testing"],
    rating: 4.5,
    interviewsCompleted: 34,
    successRate: "81%",
    profileImage: "./profilepic16.png"
  },
  {
    name: "Kevin Chang",
    currentRole: "Blockchain Developer",
    currentCompany: "Coinbase",
    education: "Blockchain Bootcamp",
    yearsExperience: 2,
    skills: ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "DeFi"],
    rating: 4.4,
    interviewsCompleted: 18,
    successRate: "78%",
    profileImage: "./profilepic17.png"
  },
  {
    name: "Grace Murphy",
    currentRole: "Technical Writer",
    currentCompany: "MongoDB",
    previousCompany: "Twilio",
    education: "UC Berkeley English Literature",
    yearsExperience: 4,
    skills: ["Technical Documentation", "API Documentation", "Markdown", "Git", "Content Strategy"],
    rating: 4.6,
    interviewsCompleted: 27,
    successRate: "85%",
    profileImage: "./profilepic18.png"
  },
  {
    name: "Daniel Brooks",
    currentRole: "Game Developer",
    currentCompany: "Unity",
    education: "DigiPen Institute of Technology",
    yearsExperience: 6,
    skills: ["C#", "Unity Engine", "Game Design", "3D Modeling", "Shader Programming"],
    rating: 4.7,
    interviewsCompleted: 39,
    successRate: "87%",
    profileImage: "./profilepic19.png"
  },
  {
    name: "Olivia Roberts",
    currentRole: "Database Administrator",
    currentCompany: "Oracle",
    previousCompany: "IBM",
    education: "University of Michigan Information Systems",
    yearsExperience: 8,
    skills: ["Oracle", "SQL Server", "MySQL", "Performance Tuning", "Backup & Recovery"],
    rating: 4.8,
    interviewsCompleted: 62,
    successRate: "92%",
    profileImage: "./profilepic20.png"
  },
  {
    name: "Tyler Scott",
    currentRole: "AI Research Scientist",
    currentCompany: "OpenAI",
    education: "PhD in Machine Learning from MIT",
    yearsExperience: 9,
    skills: ["Natural Language Processing", "Transformers", "Research", "Python", "JAX"],
    rating: 4.9,
    interviewsCompleted: 73,
    successRate: "97%",
    profileImage: "./profilepic21.png"
  },
  {
    name: "Megan Davis",
    currentRole: "Systems Administrator",
    currentCompany: "Red Hat",
    education: "Linux Professional Institute Certification",
    yearsExperience: 5,
    skills: ["Linux", "Shell Scripting", "Network Administration", "Ansible", "Monitoring"],
    rating: 4.5,
    interviewsCompleted: 32,
    successRate: "83%",
    profileImage: "./profilepic22.png"
  },
  {
    name: "Jordan Williams",
    currentRole: "Embedded Systems Engineer",
    currentCompany: "Intel",
    previousCompany: "Qualcomm",
    education: "Purdue Electrical Engineering",
    yearsExperience: 7,
    skills: ["C/C++", "Microcontrollers", "RTOS", "Hardware Design", "Signal Processing"],
    rating: 4.7,
    interviewsCompleted: 48,
    successRate: "89%",
    profileImage: "./profilepic23.png"
  },
  {
    name: "Hannah Miller",
    currentRole: "Scrum Master",
    currentCompany: "Spotify",
    education: "Certified Scrum Master",
    yearsExperience: 4,
    skills: ["Agile", "Scrum", "Team Leadership", "JIRA", "Conflict Resolution"],
    rating: 4.6,
    interviewsCompleted: 35,
    successRate: "86%",
    profileImage: "./profilepic24.png"
  },
  {
    name: "Brandon Lee",
    currentRole: "Network Engineer",
    currentCompany: "Cisco",
    education: "CCNA Certification",
    yearsExperience: 6,
    skills: ["Routing & Switching", "Network Security", "OSPF", "BGP", "VPN"],
    rating: 4.4,
    interviewsCompleted: 29,
    successRate: "79%",
    profileImage: "./profilepic25.png"
  },
  {
    name: "Chloe Johnson",
    currentRole: "Business Analyst",
    currentCompany: "Salesforce",
    previousCompany: "Workday",
    education: "University of Pennsylvania Business",
    yearsExperience: 3,
    skills: ["Requirements Gathering", "Process Improvement", "SQL", "Tableau", "Stakeholder Management"],
    rating: 4.5,
    interviewsCompleted: 26,
    successRate: "84%",
    profileImage: "./profilepic26.png"
  },
  {
    name: "Ethan Brown",
    currentRole: "Platform Engineer",
    currentCompany: "Datadog",
    education: "Carnegie Mellon Systems Engineering",
    yearsExperience: 5,
    skills: ["Infrastructure as Code", "CI/CD", "Monitoring", "Scaling", "Performance Optimization"],
    rating: 4.7,
    interviewsCompleted: 42,
    successRate: "88%",
    profileImage: "./profilepic27.png"
  },
  {
    name: "Isabella Garcia",
    currentRole: "Marketing Technology Specialist",
    currentCompany: "HubSpot",
    education: "Northwestern University Marketing",
    yearsExperience: 4,
    skills: ["Marketing Automation", "CRM", "Analytics", "Email Marketing", "Lead Generation"],
    rating: 4.6,
    interviewsCompleted: 31,
    successRate: "85%",
    profileImage: "./profilepic28.png"
  },
  {
    name: "Noah Wilson",
    currentRole: "Solutions Architect",
    currentCompany: "AWS",
    previousCompany: "Microsoft",
    education: "University of Illinois Computer Science",
    yearsExperience: 8,
    skills: ["Cloud Architecture", "Microservices", "Event-Driven Architecture", "Serverless", "Cost Optimization"],
    rating: 4.8,
    interviewsCompleted: 59,
    successRate: "91%",
    profileImage: "./profilepic29.png"
  },
  {
    name: "Ava Thompson",
    currentRole: "Content Strategist",
    currentCompany: "Medium",
    education: "Columbia Journalism School",
    yearsExperience: 3,
    skills: ["Content Strategy", "SEO", "Social Media", "Analytics", "Brand Storytelling"],
    rating: 4.4,
    interviewsCompleted: 22,
    successRate: "80%",
    profileImage: "./profilepic30.png"
  },
  {
    name: "Lucas Martinez",
    currentRole: "Cybersecurity Analyst",
    currentCompany: "CrowdStrike",
    education: "CISSP Certified",
    yearsExperience: 5,
    skills: ["Threat Detection", "Incident Response", "SIEM", "Forensics", "Risk Assessment"],
    rating: 4.7,
    interviewsCompleted: 37,
    successRate: "87%",
    profileImage: "./profilepic31.png"
  },
  {
    name: "Zoe Anderson",
    currentRole: "Growth Hacker",
    currentCompany: "Dropbox",
    previousCompany: "Pinterest",
    education: "UC Berkeley Economics",
    yearsExperience: 4,
    skills: ["A/B Testing", "User Acquisition", "Product Analytics", "Conversion Optimization", "Growth Strategy"],
    rating: 4.5,
    interviewsCompleted: 28,
    successRate: "82%",
    profileImage: "./profilepic32.png"
  },
  {
    name: "Mason Taylor",
    currentRole: "Robotics Engineer",
    currentCompany: "Boston Dynamics",
    education: "MIT Mechanical Engineering",
    yearsExperience: 6,
    skills: ["ROS", "Computer Vision", "Motion Planning", "Control Systems", "Machine Learning"],
    rating: 4.8,
    interviewsCompleted: 45,
    successRate: "90%",
    profileImage: "./profilepic33.png"
  },
  {
    name: "Lily Chen",
    currentRole: "Technical Recruiter",
    currentCompany: "Google",
    education: "HR Management Certificate",
    yearsExperience: 5,
    skills: ["Technical Recruiting", "Talent Sourcing", "Interview Coordination", "Candidate Experience", "ATS"],
    rating: 4.6,
    interviewsCompleted: 156,
    successRate: "88%",
    profileImage: "./profilepic34.png"
  },
  {
    name: "Carter Rodriguez",
    currentRole: "IoT Developer",
    currentCompany: "Samsung",
    education: "Georgia Tech Electrical Engineering",
    yearsExperience: 3,
    skills: ["Arduino", "Raspberry Pi", "MQTT", "Sensor Integration", "Edge Computing"],
    rating: 4.4,
    interviewsCompleted: 21,
    successRate: "76%",
    profileImage: "./profilepic35.png"
  },
  {
    name: "Aria Wilson",
    currentRole: "Financial Technology Analyst",
    currentCompany: "Goldman Sachs",
    previousCompany: "JP Morgan",
    education: "Wharton School of Business",
    yearsExperience: 7,
    skills: ["Financial Modeling", "Risk Analysis", "Python", "Bloomberg Terminal", "Derivatives"],
    rating: 4.7,
    interviewsCompleted: 51,
    successRate: "89%",
    profileImage: "./profilepic36.png"
  },
  {
    name: "Kai Jackson",
    currentRole: "AR/VR Developer",
    currentCompany: "Meta",
    education: "USC Computer Graphics",
    yearsExperience: 4,
    skills: ["Unity", "Unreal Engine", "C#", "3D Graphics", "Oculus SDK"],
    rating: 4.5,
    interviewsCompleted: 27,
    successRate: "81%",
    profileImage: "./profilepic37.png"
  },
  {
    name: "Maya Patel",
    currentRole: "Data Engineer",
    currentCompany: "Airbnb",
    previousCompany: "Lyft",
    education: "University of Chicago Statistics",
    yearsExperience: 5,
    skills: ["Apache Spark", "Kafka", "Hadoop", "Python", "Data Warehousing"],
    rating: 4.8,
    interviewsCompleted: 43,
    successRate: "92%",
    profileImage: "./profilepic38.png"
  },
  {
    name: "Logan Clark",
    currentRole: "Technical Support Engineer",
    currentCompany: "Zendesk",
    education: "Computer Science Bootcamp",
    yearsExperience: 2,
    skills: ["Customer Support", "Troubleshooting", "SQL", "API Integration", "Documentation"],
    rating: 4.3,
    interviewsCompleted: 18,
    successRate: "77%",
    profileImage: "./profilepic39.png"
  },
  {
    name: "Ruby Foster",
    currentRole: "UX Researcher",
    currentCompany: "Adobe",
    education: "Stanford Psychology",
    yearsExperience: 4,
    skills: ["User Research", "Usability Testing", "Survey Design", "Data Analysis", "Persona Development"],
    rating: 4.6,
    interviewsCompleted: 33,
    successRate: "85%",
    profileImage: "./profilepic40.png"
  },
  {
    name: "Phoenix Lee",
    currentRole: "Compiler Engineer",
    currentCompany: "LLVM Foundation",
    education: "PhD in Programming Languages",
    yearsExperience: 8,
    skills: ["LLVM", "Compiler Design", "Optimization", "Programming Language Theory", "C++"],
    rating: 4.9,
    interviewsCompleted: 67,
    successRate: "94%",
    profileImage: "./profilepic41.png"
  },
  {
    name: "River Thompson",
    currentRole: "Sales Engineer",
    currentCompany: "Snowflake",
    previousCompany: "MongoDB",
    education: "MIT Business Engineering",
    yearsExperience: 6,
    skills: ["Technical Sales", "Solution Architecture", "Presentations", "CRM", "Database Knowledge"],
    rating: 4.7,
    interviewsCompleted: 49,
    successRate: "88%",
    profileImage: "./profilepic42.png"
  },
  {
    name: "Sage Miller",
    currentRole: "Release Manager",
    currentCompany: "Atlassian",
    education: "Project Management Professional",
    yearsExperience: 5,
    skills: ["Release Planning", "Risk Management", "Cross-team Coordination", "CI/CD", "Change Management"],
    rating: 4.5,
    interviewsCompleted: 38,
    successRate: "83%",
    profileImage: "./profilepic43.png"
  },
  {
    name: "Storm Davis",
    currentRole: "Performance Engineer",
    currentCompany: "Netflix",
    education: "Carnegie Mellon Computer Systems",
    yearsExperience: 7,
    skills: ["Load Testing", "Performance Analysis", "JMeter", "Profiling", "System Optimization"],
    rating: 4.8,
    interviewsCompleted: 54,
    successRate: "91%",
    profileImage: "./profilepic44.png"
  },
  {
    name: "Ember Garcia",
    currentRole: "Voice Interface Designer",
    currentCompany: "Amazon Alexa",
    education: "Interaction Design Masters",
    yearsExperience: 3,
    skills: ["Voice UI Design", "Conversation Design", "Prototyping", "User Testing", "Speech Recognition"],
    rating: 4.4,
    interviewsCompleted: 24,
    successRate: "79%",
    profileImage: "./profilepic45.png"
  },
  {
    name: "Orion Rodriguez",
    currentRole: "Infrastructure Engineer",
    currentCompany: "Uber",
    previousCompany: "DoorDash",
    education: "Stanford Systems Engineering",
    yearsExperience: 6,
    skills: ["Infrastructure", "Scalability", "Load Balancing", "Database Sharding", "Monitoring"],
    rating: 4.7,
    interviewsCompleted: 46,
    successRate: "87%",
    profileImage: "./profilepic46.png"
  },
  {
    name: "Luna Martinez",
    currentRole: "Privacy Engineer",
    currentCompany: "Apple",
    education: "Privacy Law and Technology",
    yearsExperience: 4,
    skills: ["GDPR Compliance", "Privacy by Design", "Data Protection", "Security Auditing", "Legal Technology"],
    rating: 4.6,
    interviewsCompleted: 32,
    successRate: "84%",
    profileImage: "./profilepic47.png"
  },
  {
    name: "Atlas Johnson",
    currentRole: "Quantitative Analyst",
    currentCompany: "Two Sigma",
    education: "PhD in Applied Mathematics",
    yearsExperience: 5,
    skills: ["Statistical Modeling", "Algorithmic Trading", "Python", "R", "Financial Markets"],
    rating: 4.8,
    interviewsCompleted: 41,
    successRate: "90%",
    profileImage: "./profilepic48.png"
  },
  {
    name: "Nova Wilson",
    currentRole: "Technical Program Manager",
    currentCompany: "Microsoft",
    education: "MBA in Technology Management",
    yearsExperience: 8,
    skills: ["Program Management", "Cross-functional Leadership", "Roadmap Planning", "Stakeholder Management", "Agile"],
    rating: 4.7,
    interviewsCompleted: 63,
    successRate: "89%",
    profileImage: "./profilepic49.png"
  },
  {
    name: "Cosmos Brown",
    currentRole: "Accessibility Engineer",
    currentCompany: "Microsoft",
    education: "Human-Computer Interaction",
    yearsExperience: 4,
    skills: ["WCAG", "Screen Readers", "Accessibility Testing", "Inclusive Design", "ARIA"],
    rating: 4.5,
    interviewsCompleted: 29,
    successRate: "82%",
    profileImage: "./profilepic50.png"
  },
  {
    name: "Journey Lee",
    currentRole: "Site Engineer",
    currentCompany: "Cloudflare",
    education: "Network Engineering Certification",
    yearsExperience: 5,
    skills: ["CDN", "DNS", "Network Optimization", "Edge Computing", "Performance Monitoring"],
    rating: 4.6,
    interviewsCompleted: 37,
    successRate: "85%",
    profileImage: "./profilepic51.png"
  },
  {
    name: "Blaze Taylor",
    currentRole: "API Developer",
    currentCompany: "Stripe",
    previousCompany: "Twilio",
    education: "UC Berkeley Computer Science",
    yearsExperience: 4,
    skills: ["REST APIs", "GraphQL", "API Design", "Documentation", "Rate Limiting"],
    rating: 4.7,
    interviewsCompleted: 35,
    successRate: "86%",
    profileImage: "./profilepic52.png"
  },
  {
    name: "Raven Anderson",
    currentRole: "Localization Engineer",
    currentCompany: "Duolingo",
    education: "Computational Linguistics",
    yearsExperience: 3,
    skills: ["Internationalization", "Translation Management", "Cultural Adaptation", "Unicode", "Localization Testing"],
    rating: 4.4,
    interviewsCompleted: 26,
    successRate: "81%",
    profileImage: "./profilepic53.png"
  },
  {
    name: "Indigo Martinez",
    currentRole: "Bioinformatics Engineer",
    currentCompany: "23andMe",
    education: "PhD in Computational Biology",
    yearsExperience: 6,
    skills: ["Genomics", "Python", "R", "Bioinformatics Pipelines", "Statistical Analysis"],
    rating: 4.8,
    interviewsCompleted: 44,
    successRate: "91%",
    profileImage: "./profilepic54.png"
  },
  {
    name: "Soren Clark",
    currentRole: "Integration Engineer",
    currentCompany: "Zapier",
    education: "Systems Integration Certification",
    yearsExperience: 4,
    skills: ["API Integration", "Webhooks", "Data Transformation", "Workflow Automation", "Third-party APIs"],
    rating: 4.5,
    interviewsCompleted: 31,
    successRate: "83%",
    profileImage: "./profilepic55.png"
  },
  {
    name: "Wren Thompson",
    currentRole: "Search Engineer",
    currentCompany: "Elasticsearch",
    education: "Information Retrieval Masters",
    yearsExperience: 5,
    skills: ["Elasticsearch", "Search Algorithms", "Information Retrieval", "Lucene", "Query Optimization"],
    rating: 4.6,
    interviewsCompleted: 39,
    successRate: "87%",
    profileImage: "./profilepic56.png"
  },
  {
    name: "Echo Garcia",
    currentRole: "Audio Engineer",
    currentCompany: "Spotify",
    previousCompany: "SoundCloud",
    education: "Audio Engineering Technology",
    yearsExperience: 6,
    skills: ["Digital Signal Processing", "Audio Codecs", "Real-time Audio", "C++", "Audio Analysis"],
    rating: 4.7,
    interviewsCompleted: 42,
    successRate: "88%",
    profileImage: "./profilepic57.png"
  },
  {
    name: "Vale Rodriguez",
    currentRole: "Computer Vision Engineer",
    currentCompany: "NVIDIA",
    education: "PhD in Computer Vision",
    yearsExperience: 7,
    skills: ["OpenCV", "Deep Learning", "Image Processing", "CUDA", "Object Detection"],
    rating: 4.8,
    interviewsCompleted: 52,
    successRate: "92%",
    profileImage: "./profilepic58.png"
  },
  {
    name: "Sage Johnson",
    currentRole: "Configuration Management Engineer",
    currentCompany: "Red Hat",
    education: "Linux System Administration",
    yearsExperience: 5,
    skills: ["Ansible", "Puppet", "Chef", "Infrastructure as Code", "Version Control"],
    rating: 4.5,
    interviewsCompleted: 34,
    successRate: "84%",
    profileImage: "./profilepic59.png"
  },
  {
    name: "River Martinez",
    currentRole: "Firmware Engineer",
    currentCompany: "Apple",
    education: "Electrical Engineering Masters",
    yearsExperience: 6,
    skills: ["Embedded C", "Hardware Interfaces", "Device Drivers", "RTOS", "Low-level Programming"],
    rating: 4.7,
    interviewsCompleted: 45,
    successRate: "89%",
    profileImage: "./profilepic60.png"
  },
  {
    name: "Aspen Wilson",
    currentRole: "Customer Success Engineer",
    currentCompany: "Intercom",
    education: "Computer Science with Business Minor",
    yearsExperience: 3,
    skills: ["Customer Success", "Technical Support", "Product Training", "Relationship Management", "CRM"],
    rating: 4.4,
    interviewsCompleted: 27,
    successRate: "80%",
    profileImage: "./profilepic61.png"
  },
  {
    name: "Rowan Brown",
    currentRole: "Automation Engineer",
    currentCompany: "Tesla",
    education: "Industrial Engineering",
    yearsExperience: 5,
    skills: ["Test Automation", "Python", "Selenium", "CI/CD", "Quality Assurance"],
    rating: 4.6,
    interviewsCompleted: 36,
    successRate: "85%",
    profileImage: "./profilepic62.png"
  },
  {
    name: "Onyx Lee",
    currentRole: "Hardware Engineer",
    currentCompany: "Intel",
    previousCompany: "AMD",
    education: "Computer Engineering PhD",
    yearsExperience: 8,
    skills: ["VLSI Design", "Hardware Verification", "Verilog", "FPGA", "Circuit Analysis"],
    rating: 4.8,
    interviewsCompleted: 58,
    successRate: "91%",
    profileImage: "./profilepic63.png"
  },
  {
    name: "Cedar Taylor",
    currentRole: "Technical Writer",
    currentCompany: "GitLab",
    education: "English Literature with Technical Writing Certificate",
    yearsExperience: 4,
    skills: ["Technical Documentation", "Developer Experience", "Markdown", "Git", "API Documentation"],
    rating: 4.5,
    interviewsCompleted: 32,
    successRate: "83%",
    profileImage: "./profilepic64.png"
  },
  {
    name: "Sage Anderson",
    currentRole: "Middleware Engineer",
    currentCompany: "IBM",
    previousCompany: "Oracle",
    education: "Distributed Systems Masters",
    yearsExperience: 7,
    skills: ["Message Queues", "Enterprise Integration", "Java EE", "WebSphere", "Service-Oriented Architecture"],
    rating: 4.7,
    interviewsCompleted: 49,
    successRate: "88%",
    profileImage: "./profilepic65.png"
  },
  {
    name: "Maple Garcia",
    currentRole: "Geospatial Developer",
    currentCompany: "Esri",
    education: "Geography with GIS Specialization",
    yearsExperience: 5,
    skills: ["GIS", "Spatial Analysis", "PostGIS", "ArcGIS", "Geospatial Data"],
    rating: 4.6,
    interviewsCompleted: 38,
    successRate: "86%",
    profileImage: "./profilepic66.png"
  },
  {
    name: "Forest Rodriguez",
    currentRole: "Streaming Engineer",
    currentCompany: "Kafka",
    education: "Real-time Systems Engineering",
    yearsExperience: 4,
    skills: ["Apache Kafka", "Stream Processing", "Real-time Analytics", "Distributed Systems", "Event Streaming"],
    rating: 4.7,
    interviewsCompleted: 35,
    successRate: "87%",
    profileImage: "./profilepic67.png"
  },
  {
    name: "Ocean Johnson",
    currentRole: "Compliance Engineer",
    currentCompany: "Coinbase",
    education: "Regulatory Technology Masters",
    yearsExperience: 6,
    skills: ["Regulatory Compliance", "AML", "KYC", "Risk Assessment", "Financial Technology"],
    rating: 4.5,
    interviewsCompleted: 41,
    successRate: "84%",
    profileImage: "./profilepic68.png"
  },
  {
    name: "Canyon Wilson",
    currentRole: "Edge Computing Engineer",
    currentCompany: "AWS",
    education: "Distributed Computing PhD",
    yearsExperience: 5,
    skills: ["Edge Computing", "IoT", "5G Networks", "Distributed Systems", "Real-time Processing"],
    rating: 4.8,
    interviewsCompleted: 43,
    successRate: "90%",
    profileImage: "./profilepic69.png"
  },
  {
    name: "Meadow Brown",
    currentRole: "Healthcare Technology Specialist",
    currentCompany: "Epic Systems",
    education: "Health Informatics",
    yearsExperience: 4,
    skills: ["Healthcare IT", "HIPAA Compliance", "Electronic Health Records", "HL7", "Medical Software"],
    rating: 4.4,
    interviewsCompleted: 29,
    successRate: "81%",
    profileImage: "./profilepic70.png"
  },
  {
    name: "Ridge Lee",
    currentRole: "Monitoring Engineer",
    currentCompany: "Datadog",
    previousCompany: "New Relic",
    education: "Systems Monitoring Certification",
    yearsExperience: 5,
    skills: ["Application Monitoring", "Infrastructure Monitoring", "Alerting", "Dashboards", "Performance Analysis"],
    rating: 4.6,
    interviewsCompleted: 37,
    successRate: "85%",
    profileImage: "./profilepic71.png"
  },
  {
    name: "Valley Taylor",
    currentRole: "Energy Software Engineer",
    currentCompany: "Tesla Energy",
    education: "Renewable Energy Engineering",
    yearsExperience: 3,
    skills: ["Energy Management Systems", "Smart Grid", "Battery Management", "Solar Technology", "IoT"],
    rating: 4.5,
    interviewsCompleted: 25,
    successRate: "82%",
    profileImage: "./profilepic72.png"
  },
  {
    name: "Stone Martinez",
    currentRole: "Identity and Access Management Engineer",
    currentCompany: "Okta",
    education: "Information Security Masters",
    yearsExperience: 6,
    skills: ["IAM", "Single Sign-On", "LDAP", "OAuth", "Security Protocols"],
    rating: 4.7,
    interviewsCompleted: 46,
    successRate: "88%",
    profileImage: "./profilepic73.png"
  },
  {
    name: "Brook Anderson",
    currentRole: "Kubernetes Engineer",
    currentCompany: "CNCF",
    education: "Container Orchestration Certification",
    yearsExperience: 4,
    skills: ["Kubernetes", "Docker", "Container Orchestration", "Helm", "Service Mesh"],
    rating: 4.8,
    interviewsCompleted: 41,
    successRate: "91%",
    profileImage: "./profilepic74.png"
  },
  {
    name: "Cliff Garcia",
    currentRole: "Incident Response Engineer",
    currentCompany: "PagerDuty",
    education: "Cybersecurity Incident Response",
    yearsExperience: 5,
    skills: ["Incident Response", "Digital Forensics", "Security Analysis", "Threat Hunting", "SIEM"],
    rating: 4.6,
    interviewsCompleted: 39,
    successRate: "86%",
    profileImage: "./profilepic75.png"
  },
  {
    name: "Harbor Rodriguez",
    currentRole: "Container Security Engineer",
    currentCompany: "Twistlock",
    education: "Container Security Specialization",
    yearsExperience: 4,
    skills: ["Container Security", "Image Scanning", "Runtime Protection", "Policy Enforcement", "Compliance"],
    rating: 4.7,
    interviewsCompleted: 33,
    successRate: "87%",
    profileImage: "./profilepic76.png"
  },
  {
    name: "Bay Johnson",
    currentRole: "Data Privacy Engineer",
    currentCompany: "Privacy Technology Inc",
    education: "Data Privacy and Protection Law",
    yearsExperience: 3,
    skills: ["Data Privacy", "GDPR", "CCPA", "Privacy by Design", "Data Anonymization"],
    rating: 4.4,
    interviewsCompleted: 27,
    successRate: "80%",
    profileImage: "./profilepic77.png"
  },
  {
    name: "Cove Wilson",
    currentRole: "Financial Software Developer",
    currentCompany: "Bloomberg",
    previousCompany: "Thomson Reuters",
    education: "Financial Engineering",
    yearsExperience: 6,
    skills: ["Financial Software", "Trading Systems", "Market Data", "Risk Management", "Quantitative Analysis"],
    rating: 4.8,
    interviewsCompleted: 48,
    successRate: "90%",
    profileImage: "./profilepic78.png"
  },
  {
    name: "Dell Brown",
    currentRole: "Space Technology Engineer",
    currentCompany: "SpaceX",
    education: "Aerospace Engineering Masters",
    yearsExperience: 7,
    skills: ["Satellite Systems", "Mission Control Software", "Real-time Systems", "C++", "Python"],
    rating: 4.9,
    interviewsCompleted: 54,
    successRate: "95%",
    profileImage: "./profilepic79.png"
  },
  {
    name: "Tide Lee",
    currentRole: "Automotive Software Engineer",
    currentCompany: "Ford",
    education: "Automotive Engineering",
    yearsExperience: 5,
    skills: ["Automotive Software", "AUTOSAR", "CAN Bus", "Embedded Systems", "Functional Safety"],
    rating: 4.6,
    interviewsCompleted: 36,
    successRate: "85%",
    profileImage: "./profilepic80.png"
  },
  {
    name: "Dune Taylor",
    currentRole: "Quantum Computing Researcher",
    currentCompany: "IBM Quantum",
    education: "PhD in Quantum Physics",
    yearsExperience: 8,
    skills: ["Quantum Computing", "Qiskit", "Quantum Algorithms", "Linear Algebra", "Physics"],
    rating: 4.9,
    interviewsCompleted: 61,
    successRate: "96%",
    profileImage: "./profilepic81.png"
  },
  {
    name: "Grove Martinez",
    currentRole: "Agricultural Technology Developer",
    currentCompany: "John Deere",
    education: "Agricultural Engineering",
    yearsExperience: 4,
    skills: ["Precision Agriculture", "IoT Sensors", "GPS Technology", "Data Analytics", "Farm Management Software"],
    rating: 4.5,
    interviewsCompleted: 31,
    successRate: "83%",
    profileImage: "./profilepic82.png"
  },
  {
    name: "Heath Anderson",
    currentRole: "Telecommunications Engineer",
    currentCompany: "Verizon",
    education: "Telecommunications Engineering",
    yearsExperience: 6,
    skills: ["5G Networks", "Network Planning", "RF Engineering", "Telecom Protocols", "Network Optimization"],
    rating: 4.7,
    interviewsCompleted: 44,
    successRate: "88%",
    profileImage: "./profilepic83.png"
  },
  {
    name: "Field Garcia",
    currentRole: "Smart City Engineer",
    currentCompany: "Cisco Smart Cities",
    education: "Urban Technology Masters",
    yearsExperience: 5,
    skills: ["Smart Infrastructure", "IoT Integration", "Urban Analytics", "Sensor Networks", "City Planning Technology"],
    rating: 4.6,
    interviewsCompleted: 38,
    successRate: "86%",
    profileImage: "./profilepic84.png"
  },
  {
    name: "Marsh Rodriguez",
    currentRole: "Environmental Data Scientist",
    currentCompany: "Environmental Defense Fund",
    education: "Environmental Science with Data Analytics",
    yearsExperience: 4,
    skills: ["Environmental Data", "Climate Modeling", "Satellite Data Analysis", "R", "Geographic Information Systems"],
    rating: 4.5,
    interviewsCompleted: 32,
    successRate: "84%",
    profileImage: "./profilepic85.png"
  },
  {
    name: "Prairie Johnson",
    currentRole: "Supply Chain Technology Analyst",
    currentCompany: "Amazon Logistics",
    education: "Supply Chain Management with IT",
    yearsExperience: 3,
    skills: ["Supply Chain Optimization", "Logistics Software", "Inventory Management", "Data Analysis", "Process Automation"],
    rating: 4.4,
    interviewsCompleted: 26,
    successRate: "81%",
    profileImage: "./profilepic86.png"
  },
  {
    name: "Summit Wilson",
    currentRole: "Sports Technology Developer",
    currentCompany: "ESPN",
    education: "Sports Analytics and Technology",
    yearsExperience: 4,
    skills: ["Sports Analytics", "Real-time Data Processing", "Computer Vision", "Mobile Apps", "Broadcasting Technology"],
    rating: 4.6,
    interviewsCompleted: 34,
    successRate: "85%",
    profileImage: "./profilepic87.png"
  },
  {
    name: "Frost Brown",
    currentRole: "Music Technology Engineer",
    currentCompany: "Spotify",
    previousCompany: "Apple Music",
    education: "Music Technology Masters",
    yearsExperience: 5,
    skills: ["Audio Processing", "Music Recommendation Systems", "Digital Signal Processing", "Machine Learning", "Audio Codecs"],
    rating: 4.7,
    interviewsCompleted: 42,
    successRate: "89%",
    profileImage: "./profilepic88.png"
  },
  {
    name: "Glen Lee",
    currentRole: "Food Technology Software Engineer",
    currentCompany: "DoorDash",
    education: "Food Science with Computer Science",
    yearsExperience: 3,
    skills: ["Food Delivery Algorithms", "Route Optimization", "Mobile Development", "Real-time Tracking", "Database Management"],
    rating: 4.4,
    interviewsCompleted: 28,
    successRate: "82%",
    profileImage: "./profilepic89.png"
  },
  {
    name: "Vale Taylor",
    currentRole: "Fashion Technology Developer",
    currentCompany: "Stitch Fix",
    education: "Fashion Technology and Data Science",
    yearsExperience: 4,
    skills: ["Recommendation Systems", "Computer Vision for Fashion", "Style Analytics", "E-commerce", "Machine Learning"],
    rating: 4.5,
    interviewsCompleted: 33,
    successRate: "84%",
    profileImage: "./profilepic90.png"
  },
  {
    name: "Shore Martinez",
    currentRole: "Travel Technology Engineer",
    currentCompany: "Airbnb",
    education: "Hospitality Technology",
    yearsExperience: 5,
    skills: ["Booking Systems", "Search Algorithms", "Payment Processing", "Mobile Applications", "Scalable Architecture"],
    rating: 4.6,
    interviewsCompleted: 39,
    successRate: "87%",
    profileImage: "./profilepic91.png"
  },
  {
    name: "Crest Anderson",
    currentRole: "Education Technology Developer",
    currentCompany: "Khan Academy",
    education: "Educational Technology Masters",
    yearsExperience: 4,
    skills: ["Learning Management Systems", "Educational Analytics", "Adaptive Learning", "Content Management", "User Experience"],
    rating: 4.5,
    interviewsCompleted: 31,
    successRate: "83%",
    profileImage: "./profilepic92.png"
  },
  {
    name: "Peak Garcia",
    currentRole: "Real Estate Technology Engineer",
    currentCompany: "Zillow",
    education: "Real Estate Technology",
    yearsExperience: 3,
    skills: ["Property Valuation Algorithms", "Geographic Data Processing", "Market Analysis", "Web Scraping", "Data Visualization"],
    rating: 4.4,
    interviewsCompleted: 27,
    successRate: "80%",
    profileImage: "./profilepic93.png"
  },
  {
    name: "Bluff Rodriguez",
    currentRole: "Legal Technology Developer",
    currentCompany: "LegalZoom",
    education: "Legal Technology and Computer Science",
    yearsExperience: 5,
    skills: ["Legal Software", "Document Automation", "Case Management Systems", "Compliance Technology", "Natural Language Processing"],
    rating: 4.6,
    interviewsCompleted: 37,
    successRate: "86%",
    profileImage: "./profilepic94.png"
  },
  {
    name: "Ridge Johnson",
    currentRole: "Insurance Technology Analyst",
    currentCompany: "Progressive",
    education: "Actuarial Science with IT",
    yearsExperience: 4,
    skills: ["Insurance Software", "Risk Assessment Technology", "Claims Processing", "Telematics", "Data Analytics"],
    rating: 4.5,
    interviewsCompleted: 32,
    successRate: "84%",
    profileImage: "./profilepic95.png"
  },
  {
    name: "Creek Wilson",
    currentRole: "Retail Technology Engineer",
    currentCompany: "Target",
    previousCompany: "Walmart Labs",
    education: "Retail Technology and Analytics",
    yearsExperience: 5,
    skills: ["E-commerce Platforms", "Inventory Management Systems", "Point of Sale", "Supply Chain Technology", "Customer Analytics"],
    rating: 4.6,
    interviewsCompleted: 38,
    successRate: "85%",
    profileImage: "./profilepic96.png"
  },
  {
    name: "Trail Brown",
    currentRole: "Healthcare AI Engineer",
    currentCompany: "Google Health",
    education: "Biomedical Engineering with AI",
    yearsExperience: 6,
    skills: ["Medical AI", "Healthcare Data", "Clinical Decision Support", "Medical Imaging", "HIPAA Compliance"],
    rating: 4.8,
    interviewsCompleted: 47,
    successRate: "91%",
    profileImage: "./profilepic97.png"
  },
  {
    name: "Path Lee",
    currentRole: "Gaming Infrastructure Engineer",
    currentCompany: "Epic Games",
    education: "Game Development and Infrastructure",
    yearsExperience: 4,
    skills: ["Game Servers", "Multiplayer Architecture", "Real-time Networking", "Load Balancing", "Game Analytics"],
    rating: 4.7,
    interviewsCompleted: 35,
    successRate: "88%",
    profileImage: "./profilepic98.png"
  },
  {
    name: "Bridge Taylor",
    currentRole: "Construction Technology Engineer",
    currentCompany: "Autodesk",
    education: "Construction Management with Technology",
    yearsExperience: 5,
    skills: ["Building Information Modeling", "Construction Software", "Project Management Tools", "3D Modeling", "IoT for Construction"],
    rating: 4.6,
    interviewsCompleted: 36,
    successRate: "86%",
    profileImage: "./profilepic99.png"
  },
  {
    name: "Dawn Martinez",
    currentRole: "Renewable Energy Software Engineer",
    currentCompany: "Tesla Solar",
    education: "Renewable Energy Engineering",
    yearsExperience: 4,
    skills: ["Solar Energy Systems", "Energy Storage", "Grid Integration", "Power Electronics", "Energy Management Software"],
    rating: 4.7,
    interviewsCompleted: 34,
    successRate: "87%",
    profileImage: "./profilepic100.png"
  }
];


  // Filter profiles based on search term
  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) {
      return profiles;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return profiles.filter(profile => 
      profile.name.toLowerCase().includes(searchLower) ||
      profile.title.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, profiles]);
 const navigate = useNavigate();
   const items = [
    { icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />, label: "Home", onClick: () => navigate('/Dashboard') },
    { icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />, label: "Interviews", onClick: () => navigate('/Interview') },
    { icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />, label: "Create", onClick: () => navigate('/Create') },
    { icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />, label: "Saves", onClick: () => navigate('/Saves') },
    { icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />, label: "Profile", onClick: () => navigate('/Profile') },
     {
      icon: <img src="/ViewProfile.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Explore",
       onClick: () => navigate('/ViewProfile'),
    },
  ];

  return (
    // Add unique wrapper class here
    <div className="view-profile-page-wrapper">
      <div className="dashboard-bg-orbs">
  <div className="dashboard-orb dashboard-orb1"></div>
  <div className="dashboard-orb dashboard-orb2"></div>
  <div className="dashboard-orb dashboard-orb3"></div>
  <div className="dashboard-orb dashboard-orb4"></div>
  <div className="dashboard-orb dashboard-orb5"></div>
</div>
      <div className="search-page">
        <div className="page-header">
          <div className="logo-containernew">
            <span className="logonew">Askora</span>
          </div>
        </div>
        
        <div className="page-content">
          <div className="search-container">
            <div className="search-wrapper">
              <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="profiles-grid">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))
            ) : (
              <div className="no-results">
                No designers found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
        <Dock
          items={items}
          panelHeight={78}
          baseItemSize={60}
          magnification={80}
        />
      </div>
    </div>
  );
};

export default ViewProfile;