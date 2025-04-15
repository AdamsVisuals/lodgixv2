// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    const darkModeSwitch = document.getElementById('dark-mode-switch');
    const body = document.body;
  
    // Check for saved user preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
      body.classList.add('dark-mode');
      darkModeSwitch.checked = true;
    } else if (savedMode === 'disabled') {
      body.classList.remove('dark-mode');
      darkModeSwitch.checked = false;
    }
  
    // Toggle dark mode
    darkModeSwitch.addEventListener('change', function() {
      if (this.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
      } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
      }
    });
  });