using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using portfolyo2.Controllers;

namespace portfolyo2.Controllers
{
    public class EducationController : Controller
    {
        // GET: Education
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();
        public ActionResult Index()
        {
           var values = db.tbl_education.ToList();
            return View(values);
        }
       
    }
}