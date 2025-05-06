using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class ProjectController : Controller
    {
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        // GET: Project
        public ActionResult Index()
        {
            var values = db.tbl_project.ToList();
            return View(values);
        }
        public ActionResult RemoveProject(int id)
        {
            var values = db.tbl_project.Find(id);
            db.tbl_project.Remove(values);
            db.SaveChanges(); //ctrl s
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult CreateProject()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateProject(tbl_project _Project) //Project ıd, Project name 
        {
            db.tbl_project.Add(_Project);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateProject(int id)
        {
            var values = db.tbl_project.Find(id);
            return View(values);

        }

        [HttpPost]
        public ActionResult UpdateProject(tbl_project model)
        {
            var value = db.tbl_project.Find(model.ProjectID);
            value.ProjectName = model.ProjectName;
            value.Description = model.Description;
            value.ProjectLink = model.ProjectLink;
            value.image1 = model.image1;
            value.image2 = model.image2;
            value.image3 = model.image3;
            

            db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}