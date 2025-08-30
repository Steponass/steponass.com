export const projects = [
  {
    id: 1,
    title: "Co~Learn",
    description: "An online tutoring platform featuring session scheduling, video conferencing, and automated email notifications.",
    gridArea: "item1",
    overview: {
      role: "Full-Stack Developer",
      description: "Led the development of Co~Learn from concept to deployment, architecting a scalable tutoring platform that seamlessly integrates video conferencing with intuitive scheduling. Built with modern React ecosystem and real-time capabilities to enhance the learning experience for both tutors and students."
    },
    sections: {
      process: {
        text: "Built with a mobile-first approach, focusing on intuitive scheduling and seamless video integration. Implemented real-time notifications and session management for optimal user experience.",
        image: "/assets/images/projects/colearn/process-placeholder.jpg"
      },
      tools: [
        { name: "React", icon: "/assets/icons/tech stack/react/React_Logo_0.svg" },
        { name: "Next.js", icon: "/assets/icons/tech stack/Next.js.svg" },
        { name: "Supabase", icon: "/assets/icons/tech stack/supabase/supabase-logo-wordmark--light.svg" },
        { name: "LiveKit", icon: "/assets/icons/tech stack/liveKit/LK_wordmark_dark_lightbg.svg" },
      ],
      challenges: {
        text: "Integrating real-time video conferencing with session scheduling while maintaining optimal performance across devices. Managing state between multiple users and ensuring reliable email notifications.",
        image: "/assets/images/projects/colearn/challenges-placeholder.jpg"
      },
      lessons: {
        text: "Learned the importance of thorough testing with video APIs and the complexity of real-time collaborative features. Gained experience with database design for scheduling systems.",
        image: "/assets/images/projects/colearn/lessons-placeholder.jpg"
      }
    }
  },
  {
    id: 2,
    title: "Co-Narrate",
    description: "Using speech recognition to help English learners track target phrase usage.",
    gridArea: "item2",
    overview: {
      role: "Frontend Developer",
      description: "Designed and developed Co-Narrate as an innovative language learning tool that leverages browser speech recognition to provide real-time feedback. Focused on creating an accessible, intuitive interface that helps English learners improve their pronunciation through visual cues and progress tracking."
    },
    sections: {
      process: {
        text: "Developed an innovative approach to language learning by combining speech recognition with visual feedback. Created an intuitive interface that helps users track their pronunciation progress.",
        image: "/assets/images/projects/conarrate/process-placeholder.jpg"
      },
      tools: [
        { name: "React", icon: "/assets/icons/tech stack/react/React_Logo_3.svg" },
        { name: "Tailwind CSS", icon: "/assets/icons/tech stack/tailwind" },
        { name: "Web Speech API", icon: "placeholder-speech-api.svg" },
        { name: "JavaScript", icon: "placeholder-javascript.svg" }
      ],
      challenges: {
        text: "Implementing accurate speech recognition across different accents and speaking speeds. Creating meaningful visual feedback that helps users improve their pronunciation patterns.",
        image: "/assets/images/projects/conarrate/challenges-placeholder.jpg"
      },
      lessons: {
        text: "Discovered the intricacies of browser speech recognition APIs and the importance of accessible design in educational tools. Learned to handle real-time audio processing effectively.",
        image: "/assets/images/projects/conarrate/lessons-placeholder.jpg"
      }
    }
  },
  {
    id: 3,
    title: "Monochrome & Framing",
    description: "2 tailor-made websites where design challenges where as fun as the technical ones.",
    gridArea: "item4",
    overview: {
      role: "Frontend Developer & Designer",
      description: "Created two distinct, custom websites that pushed the boundaries of web design and animation. Balanced artistic vision with technical excellence, crafting unique visual identities while ensuring optimal performance and user experience across both projects."
    },
    sections: {
      process: {
        text: "Designed and developed custom websites with unique visual identities. Focused on creating engaging animations and smooth user interactions while maintaining clean, professional aesthetics.",
        image: "/assets/images/projects/monochrome-framing/process-placeholder.jpg"
      },
      tools: [
        { name: "JavaScript", icon: "placeholder-javascript.svg" },
        { name: "React", icon: "/assets/icons/tech stack/react/React_Logo_3.svg" },
        { name: "EmailJS", icon: "placeholder-emailjs.svg" },
        { name: "GSAP", icon: "/assets/icons/tech stack/gsap" },
        { name: "CSS3", icon: "placeholder-css3.svg" },
        { name: "HTML5", icon: "placeholder-html5.svg" }
      ],
      challenges: {
        text: "Creating distinct visual identities for each site while maintaining consistent technical quality. Implementing complex animations that enhance rather than distract from the user experience.",
        image: "/assets/images/projects/monochrome-framing/challenges-placeholder.jpg"
      },
      lessons: {
        text: "Gained deep appreciation for the balance between design and functionality. Learned advanced animation techniques and the importance of performance optimization in interactive websites.",
        image: "/assets/images/projects/monochrome-framing/lessons-placeholder.jpg"
      }
    }
  },
  {
    id: 4,
    title: "Mystify Me",
    description: "A personal project where I scratched my creative itch while deepening knowledge of React + global state mgmt",
    gridArea: "item3",
    overview: {
      role: "Creative Developer",
      description: "Developed Mystify Me as a playground for experimental web interactions and advanced React patterns. This personal project allowed me to explore the intersection of creativity and technology while mastering complex state management and animation techniques."
    },
    sections: {
      process: {
        text: "Explored creative web development while mastering modern React patterns and state management. Built interactive features that push the boundaries of typical web experiences.",
        image: "/assets/images/projects/mystify-me/process-placeholder.jpg"
      },
      tools: [
        { name: "React", icon: "/assets/icons/tech stack/react/React_Logo_3.svg" },
        { name: "Zustand", icon: "placeholder-zustand.svg" },
        { name: "GSAP", icon: "/assets/icons/tech stack/gsap" },
        { name: "CSS3", icon: "placeholder-css3.svg" },
        { name: "JavaScript", icon: "placeholder-javascript.svg" }
      ],
      challenges: {
        text: "Managing complex state across multiple interactive components while maintaining smooth animations. Balancing creative vision with technical constraints and performance requirements.",
        image: "/assets/images/projects/mystify-me/challenges-placeholder.jpg"
      },
      lessons: {
        text: "Deepened understanding of React's lifecycle and state management patterns. Learned to effectively combine creative design with technical excellence and discovered the power of Zustand for state management.",
        image: "/assets/images/projects/mystify-me/lessons-placeholder.jpg"
      }
    }
  },
  {
    id: 5,
    title: "Our Project?",
    description: "…This could be something beautiful!",
    gridArea: "item5",
    shape: "rotated",
    isDecorative: true
  },
];
