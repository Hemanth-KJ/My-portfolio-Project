import Home from "./Home";
import About from "./About";
import Education from "./Education";
import Skills from "./Skills";
import Projects from "./Projects";
import Resume from "./Resume";
import Contact from "./Contact";


function Portfolio() {
  return (
    <>
      <section id="home">
        <Home />
      </section>

      <section id="about">
        <About />
      </section>

      <section id="education">
        <Education />
      </section>

      <section id="skills">
        <Skills />
      </section>

      <section id="projects">
        <Projects />
      </section>

      <section id="resume">
        <Resume />
      </section>

      <section id="contact">
        <Contact />
      </section>

    </>
  );
}

export default Portfolio;