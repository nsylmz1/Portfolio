using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using portfolyo2.Models;

namespace portfolyo2.Controllers
{
    public class TestimonialController : Controller
    {
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();
        // GET: Testimonial
        public ActionResult Index()
        {
            var values = db.testimonials.ToList();
            return View(values);
        }


        public ActionResult DeleteTestimonial(int id) { 
        var values = db.testimonials.Find(id);
            db.testimonials.Remove(values);
            db.SaveChanges();
            return RedirectToAction("Index");
        }


        [HttpGet]
        public ActionResult CreateTestimonial()
        {
            return View();
        }

        [HttpPost]
        public ActionResult CreateTestimonial(tbl_testimonials testimonial)
        {
            db.testimonials.Add(testimonial);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateTestimonial(int id)
        {
            var values = db.testimonials.Find(id);
                return View(values);
        }

        [HttpPost]

        public ActionResult UpdateTestimonial (tbl_testimonials model)
        {
            var values = db.testimonials.Find(model.TestimonialsID);
            values.TestimonalsName = model.TestimonalsName;
            values.Description2 = model.Description2;  
            values.ImageUrl = model.ImageUrl;
            values.Description1 = model.Description1;
            db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}