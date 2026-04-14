(function(){
  function encodeFormData(form){
    const data = new FormData(form);
    return new URLSearchParams(data).toString();
  }

  function handleForm(form){
    form.addEventListener("submit", async function(e){
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }

      try{
        const body = encodeFormData(form);

        // Netlify form submission endpoint is "/"
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        });

        // Hide the form fields, show thank you
        const fields = form.querySelector(".formfields");
        const thanks = form.querySelector(".thanks");

        if (fields) fields.style.display = "none";
        if (thanks) thanks.style.display = "block";

        // Scroll to thanks
        if (thanks) thanks.scrollIntoView({behavior:"smooth", block:"start"});

      }catch(err){
        alert("Submission failed. Please try again.");
        if (submitBtn){
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Application";
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  if (!form) return;

  const thanksBox = document.querySelector(".thanks");
  if (thanksBox) {
    thanksBox.style.display = "none";
  }

  form.addEventListener("submit", function () {
    if (thanksBox) {
      setTimeout(() => {
        thanksBox.style.display = "block";
        thanksBox.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
    }
  });
});
