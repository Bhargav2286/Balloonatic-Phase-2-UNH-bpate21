function validation(event)
                                  {
                                    event & event.preventDefault(); 
                                    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                                    var emailVal = document.forms["testForm"]["emailInput"].value;
                                    console.log(emailVal);
                                    if (reg.test(emailVal) == false)
                                     {
                                         alert('Invalid Email Address');
                                         return false;
                                        }
                                  window.location = "index.html";
                            }