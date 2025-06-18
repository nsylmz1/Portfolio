using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class DefaultController : Controller
    {
        // GET: Default
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        public ActionResult Index()
        {
            return View();
        }
        public PartialViewResult PartialTestimonial()
        {
            var values = db.testimonials.ToList();
            return PartialView(values);
        }
        public PartialViewResult PartialServices()
        {
            var deger = db.tbl_services.ToList();
            return PartialView(deger);
        }

        public PartialViewResult PartialContact()
        {
            var values = db.tbl_contact.ToList();
            return PartialView(values);
        }
        public ActionResult PartialMessage()
        {
            return PartialView();
        }
        [HttpPost]
        public ActionResult PartialMessage(tbl_message message)
        {
            db.tbl_message.Add(message);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        public PartialViewResult PartialAbout()
        {
            var about = db.tbl_about.ToList();
            return PartialView(about);
        }

        public PartialViewResult PartialSkils()
        {
            var skils = db.tbl_skilss11.ToList();
            return PartialView(skils);
        }

        public PartialViewResult PartialEducation()
        {
            var education = db.tbl_education.ToList();
            return PartialView(education);
        }

        public PartialViewResult PartialJobs()
        {
            var jobs = db.tbl_Jobs.ToList();
            return PartialView(jobs);
        }

        public PartialViewResult PartialProject()
        {
            var project = db.tbl_project.ToList();  // Include ile kategori bilgisi alınıyor.
            return PartialView(project);
        }



    }
}