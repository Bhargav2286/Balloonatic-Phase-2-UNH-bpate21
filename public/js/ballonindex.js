
var indslidenum = 0;
balloonslides();

function balloonslides() 
{
  var a;
  var myslides = document.getElementsByClassName("Slideshow");
  for (a = 0; a < myslides.length; a++)
  {
    myslides[a].style.display = "none";
  }
  indslidenum++;
  if (indslidenum > myslides.length)
    {
      indslidenum = 1
    }
  myslides[indslidenum-1].style.display = "block";
  setTimeout(balloonslides, 2000); 
}

function ValidateEmail(inputvalue)
{
var mailformat =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
var x = document.forms["Subscription"]["inputtext"].value;
  if (x == "")
   {
    alert("email id must not be empty please fill it up!");
    return false;
  }

else if(inputvalue.value.match(mailformat))
{
alert("Subscription Successfully! let's go to the home page");  
document.Subscription.inputtext.focus();
return true;
}
else
{
alert("Please Enter valid email id!");    
document.Subscription.inputtext.focus();
return false;
}
}