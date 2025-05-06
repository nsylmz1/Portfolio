using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class SkillsController : Controller
    {
        // GET: Skills
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        public ActionResult Index()
        {
            var values = db.tbl_skilss11.ToList();

            return View(values);
        }
        public ActionResult RemoveSkills(int id)
        {
            var values = db.tbl_skilss11.Find(id);
            db.tbl_skilss11.Remove(values);
            db.SaveChanges(); //ctrl s
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult CreateSkills()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateSkills(tbl_skilss11 _Skills) //Skills ıd, Skills name 
        {
            db.tbl_skilss11.Add(_Skills);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateSkills(int id)
        {
            var values = db.tbl_skilss11.Find(id);
            return View(values);

        }

        [HttpPost]
        public ActionResult UpdateSkills(tbl_skilss11 model)
        {
            var value = db.tbl_skilss11.Find(model.SkillsId);
            value.SkillsName = model.SkillsName;
            value.Derece = model.Derece;
            value.Description = model.Description;

            db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}