using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using portfolyo2.Models;

namespace portfolyo2.Controllers
{
    public class CategoriesController : Controller
    {
        // GET: Categories
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();   
        public ActionResult Index()
        {
            var values = db.tbl_category.ToList();
            return View(values);
        }

        public ActionResult DeleteCategory(int id)
        {

            var values = db.tbl_category.Find(id);
            db.tbl_category.Remove(values);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult CreateCategory()
        {
            return View();  
        }

        [HttpPost]
        public ActionResult CreateCategory(tbl_category category)
        {
           db.tbl_category.Add(category);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateCategory(int id)
        {
            var values = db.tbl_category.Find(id);
            return View(values);
        }
        [HttpPost]
        public ActionResult UpdateCategory(tbl_category  model)
        {
            var value = db.tbl_category.Find(model.CategoryID);
            value.CategoryName = model.CategoryName;
            db.SaveChanges();
            return RedirectToAction("Index");   
        }

    }
}