﻿using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using portfolyo2.Controllers;

namespace portfolyo2.Controllers
{
    public class EducationController : Controller
    {
        // GET: Education
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();
        public ActionResult Index()
        {
           var values = db.tbl_education.ToList();
            return View(values);
        }
        public ActionResult RemoveEducation(int id)
        {
            var values = db.tbl_education.Find(id);
            db.tbl_education.Remove(values);
            db.SaveChanges(); //ctrl s
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult CreateEducation()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateEducation(tbl_education _Education) //Education ıd, Education name 
        {
            db.tbl_education.Add(_Education);
            db.SaveChanges();
            return RedirectToAction("Index");
        }


        [HttpGet]
        public ActionResult UpdateEducation(int id)
        {
            var values = db.tbl_education.Find(id);
            return View(values);

        }

        [HttpPost]
        public ActionResult UpdateEducation(tbl_education model)
        {
            var value = db.tbl_education.Find(model.EducationID);
            value.StartYear = model.StartYear;
            value.EndeYear = model.EndeYear;
            value.Name = model.Name;
            value.Description = model.Description;
            value.Section = model.Section;
            db.SaveChanges();
            return RedirectToAction("Index");
        }

    }
}