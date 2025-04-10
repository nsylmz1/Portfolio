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

            return View();
        }
    }
}