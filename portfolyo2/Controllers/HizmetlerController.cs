using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class HizmetlerController : Controller
    {
        // GET: Hizmetler
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        public ActionResult Index()
        {
            var values = db.tbl_services.ToList();

            return View(values);
        }

        public ActionResult RemoveServices(int id)
        {
            var values = db.tbl_services.Find(id);
            db.tbl_services.Remove(values);
            db.SaveChanges();
            return RedirectToAction("Index");

        }

        [HttpGet]
        public ActionResult CreateServices()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateServices(tbl_services _Services) //Services ıd, Services name 
        {
            db.tbl_services.Add(_Services);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateServices(int id)
        {
            var values = db.tbl_services.Find(id);
            return View(values);

        }

        [HttpPost]
        public ActionResult UpdateServices(tbl_services model)
        {
            var value = db.tbl_services.Find(model.ServiceID);
            value.Description = model.Description;
            value.tittle = model.tittle;
            value.Icon = model.Icon;
            value.description2 = model.description2;
            db.SaveChanges();
            return RedirectToAction("Index");
        }

    }
}