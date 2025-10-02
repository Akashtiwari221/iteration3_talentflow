import React from 'react';
import StaggeredMenu from '../ui/StaggeredMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faUsers, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import './LandingPage.css';

const LandingPage = () => {
  const menuItems = [
    { label: 'Home', link: '/', ariaLabel: 'Go to home page' },
    { label: 'HR Login', link: '/jobs', ariaLabel: 'HR Dashboard Login' },
    { label: 'Candidate Login', link: '/candidate-portal', ariaLabel: 'Candidate Portal Login' },
    { label: 'About', link: '/about', ariaLabel: 'About TalentFlow' },
    { label: 'Contact', link: '/contact', ariaLabel: 'Contact us' }
  ];

  const socialItems = [
    { label: 'LinkedIn', link: 'https://linkedin.com/company/talentflow' },
    { label: 'Twitter', link: 'https://twitter.com/talentflow' },
    { label: 'GitHub', link: 'https://github.com/talentflow' }
  ];

  return (
    <div className="landing-page">
      <StaggeredMenu
        position="right"
        colors={['#667eea', '#764ba2', '#f093fb']}
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl="/logo.svg"
        menuButtonColor="#ffffff"
        openMenuButtonColor="#000000"
        accentColor="#667eea"
        changeMenuColorOnOpen={true}
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={() => console.log('Menu closed')}
      />
      
      <main className="landing-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="brand-name">TalentFlow</span>
            </h1>
            <p className="hero-subtitle">
              Streamline your hiring process with our comprehensive HR management platform
            </p>
            <div className="cta-buttons">
              <a href="/jobs" className="cta-button primary">
                HR Dashboard
              </a>
              <a href="/candidate-portal" className="cta-button secondary">
                Candidate Portal
              </a>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="section-content">
            <h2 className="section-title">Key Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon"><FontAwesomeIcon icon={faBriefcase} /></div>
                <h3>Job Management</h3>
                <p>Create, manage, and track job postings with ease</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><FontAwesomeIcon icon={faUsers} /></div>
                <h3>Candidate Tracking</h3>
                <p>Organize and evaluate candidates throughout the hiring process</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><FontAwesomeIcon icon={faClipboardList} /></div>
                <h3>Smart Assessments</h3>
                <p>Create custom assessments to evaluate candidate skills</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Candidates Managed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Active Job Postings</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support Available</div>
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className="section-content">
            <h2 className="section-title">How TalentFlow Works</h2>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">01</div>
                <h3>Post Jobs</h3>
                <p>Create detailed job postings with requirements, salary ranges, and auto-archive timers</p>
              </div>
              <div className="step-item">
                <div className="step-number">02</div>
                <h3>Manage Candidates</h3>
                <p>Track candidates through different stages of your hiring pipeline</p>
              </div>
              <div className="step-item">
                <div className="step-number">03</div>
                <h3>Assess Skills</h3>
                <p>Create custom assessments to evaluate candidate capabilities</p>
              </div>
              <div className="step-item">
                <div className="step-number">04</div>
                <h3>Make Decisions</h3>
                <p>Use data-driven insights to make informed hiring decisions</p>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials-section">
          <div className="section-content">
            <h2 className="section-title">What Our Clients Say</h2>
            <div className="testimonials-grid">
              <div className="testimonial-item">
                <p className="testimonial-text">"TalentFlow has revolutionized our hiring process. It's intuitive, efficient, and incredibly powerful!"</p>
                <p className="testimonial-author">- Jane Doe, HR Manager at CorpCo</p>
              </div>
              <div className="testimonial-item">
                <p className="testimonial-text">"The assessment tools are a game-changer. We're finding better candidates faster than ever before."</p>
                <p className="testimonial-author">- John Smith, CEO of InnovateX</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} TalentFlow. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
