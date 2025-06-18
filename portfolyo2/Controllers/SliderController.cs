using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class SliderController : Controller
    {
        // GET: Slider


        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        public ActionResult Index()
        {
            var values = db.tbl_slider.ToList();

            return View(values);
        }
        public ActionResult RemoveSlider(int id)
        {
            var values = db.tbl_slider.Find(id);
            db.tbl_slider.Remove(values);
            db.SaveChanges(); //ctrl s
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult CreateSlider()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateSlider(tbl_slider _Slider) //Slider ıd, Slider name 
        {
            db.tbl_slider.Add(_Slider);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateSlider(int id)
        {
            var values = db.tbl_slider.Find(id);
            return View(values);
        }

        [HttpPost]
        public ActionResult UpdateSlider(tbl_slider model)
        {
            var value = db.tbl_slider.Find(model.SlıderID);
            value.NameSurname = model.NameSurname;
            value.Description = model.Description;
            value.ImageURL = model.ImageURL;

            db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}