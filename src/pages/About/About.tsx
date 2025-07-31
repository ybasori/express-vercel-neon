import Navbar from "@src/components/molecules/Navbar/Navbar";

function About() {
  
  return (
    
    <>
      <Navbar />

      <section className="section">
        <div className="container pt-5">
          <div className="columns">
            <div className="column">
              About
            </div>

          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <strong>Webivert</strong> by{" "}
            <a href="https://jgthms.com">Yusuf Basori</a>.
          </p>
        </div>
      </footer>
    </>
  )
}

export default About
