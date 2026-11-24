import {
  siCss,
  siExpress,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siMongodb,
  siMysql,
  siNodedotjs,
  siNumpy,
  siPandas,
  siPython,
  siReact
} from "simple-icons";
import { Network } from "lucide-react";

export const skillGroups = [
  {
    category: "Frontend Development",
    skills: [
      { name: "HTML", icons: [siHtml5] },
      { name: "CSS", icons: [siCss] },
      { name: "JavaScript", icons: [siJavascript] },
      { name: "React JS", icons: [siReact] }
    ]
  },
  {
    category: "Backend Development",
    skills: [
      { name: "Node.js", icons: [siNodedotjs] },
      { name: "Express.js", icons: [siExpress] },
      { name: "MongoDB", icons: [siMongodb] },
      { name: "MySQL", icons: [siMysql] }
    ]
  },
  {
    category: "Programming & Data Science",
    skills: [
      { name: "Python", icons: [siPython] },
      { name: "Pandas", icons: [siPandas] },
      { name: "NumPy", icons: [siNumpy] },
      { name: "Matplotlib", image: "/images/matplotlib-original.svg" }
    ]
  },
  {
    category: "Artificial Intelligence & Machine Learning",
    skills: [
      { name: "ANN (Artificial Neural Networks)", icon: Network }
    ]
  },
  {
    category: "Tools & Version Control",
    skills: [
      { name: "Git & GitHub", icons: [siGit, siGithub] }
    ]
  }
];
