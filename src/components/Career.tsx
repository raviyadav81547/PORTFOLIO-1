import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Sales Executive</h4>
                <h5>Realturity Business Advisory Pvt. Ltd.</h5>
              </div>
              <h3>2022</h3>
            </div>
            <p>
              Generated new lending business through direct client sourcing and
              relationship management. Built a strong pipeline of prospects through
              strategic outreach and consultative selling.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Quality Assurance</h4>
                <h5>Continental Milkose India Ltd.</h5>
              </div>
              <h3>2023</h3>
            </div>
            <p>
              Monitored quality standards and ensured compliance with production
              and safety protocols. Completed four months of industrial training
              in quality assurance and compliance standards.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior Relationship Manager</h4>
                <h5>Piramal Finance Ltd.</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Managing unsecured business loan portfolio driving revenue growth
              and optimized approval turnaround. Simultaneously building AI
              automation systems and digital workflows at tapautomate.in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
