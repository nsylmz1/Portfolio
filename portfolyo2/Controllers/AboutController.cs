using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class AboutController : Controller
    {
        // GET: About
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        public ActionResult Index()
        {
            var deger = db.tbl_about.ToList();

            return View(deger);
        }

        public ActionResult RemoveAbout(int id)
        {
            var deger = db.tbl_about.Find(id);
            db.tbl_about.Remove(deger);
            db.SaveChanges(); //ctrl s
            return RedirectToAction("Index");
        }
        //[httpget] [httppost]

        [HttpGet]
        public ActionResult CreateAbout()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateAbout(tbl_about _About) //About ıd, About name 
        {
            db.tbl_about.Add(_About);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateAbout(int id)
        {
            var values = db.tbl_about.Find(id);
            return View(values);
        }

        public ActionResult UpdateAbout(tbl_about model)
        {
            var value = db.tbl_about.Find(model.AboutID);

            value.ImageURL = model.ImageURL;
            value.Tittle = model.Tittle;
            value.BirthDay = model.BirthDay;
            value.WebSite = model.WebSite;
            value.Phone = model.Phone;
            value.City = model.City;
            value.Age = model.Age;
            value.Email = model.Email;
            value.Freelance = model.Freelance;
            value.Description1 = model.Description1;
            value.Description2 = model.Description2;
            value.Degree = model.Degree;

            db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}