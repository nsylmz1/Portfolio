using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class JobsController : Controller
    {
        // GET: Jobs
        public ActionResult Index()
        {
            return View();
        }
    }
}