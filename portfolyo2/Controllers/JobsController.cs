using portfolyo2.Models;
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
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();
        public ActionResult Index()
        {
            var values = db.tbl_Jobs.ToList();
            return View(values);
        }
        public ActionResult RemoveJob(int id)
        {
            var values = db.tbl_Jobs.Find(id);
            db.tbl_Jobs.Remove(values);
            db.SaveChanges(); 
            return RedirectToAction("Index");
        }
        public ActionResult CreateJob()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateJob(tbl_Job _Job) //Job ıd, Job name 
        {
            db.tbl_Jobs.Add(_Job);
            db.SaveChanges();
            return RedirectToAction("Index");
        }
        public ActionResult UpdateJob(int id)
        {
            var values = db.tbl_Jobs.Find(id);
            return View(values);

        }
        [HttpPost]
        public ActionResult UpdateJob(tbl_Job model)
        {
            var value = db.tbl_Jobs.Find(model.JobID);
            value.Tittle = model.Tittle;
            value.StartDate = model.StartDate;
            value.EndDate = model.EndDate;
            value.CompanyName = model.CompanyName;
            value.Description = model.Description;

            db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}