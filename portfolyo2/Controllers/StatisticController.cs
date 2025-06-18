using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class StatisticController : Controller
    {
        // GET: Statistic
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();
        public ActionResult Index()
        {
            ViewBag.CategoryCount = db.tbl_category.Count();
            ViewBag.TestimonialCount = db.testimonials.Count();
            ViewBag.ProjeSayisi = db.tbl_project.Count();
            ViewBag.jobCount = db.tbl_Jobs.Count();
            ViewBag.serviceCount = db.tbl_services.Count();
            ViewBag.skillCount = db.tbl_skilss11.Count();
            ViewBag.testimonialCount = db.testimonials.Count();
            ViewBag.messageCount = db.tbl_message.Count();
            ViewBag.EducationCount = db.tbl_education.Count();

            return View();
        }
    }
}