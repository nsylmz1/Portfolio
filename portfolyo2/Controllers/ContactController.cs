using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class ContactController : Controller
    {
        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        // GET: Contact
        public ActionResult Index()
        {

            var values = db.tbl_contact.ToList();   
            return View(values);
        }
        public ActionResult RemoveContact(int id) {
            var values = db.tbl_contact.Find(id);
            db.tbl_contact.Remove(values);
            db.SaveChanges();
            return RedirectToAction("Index");

        }

        public ActionResult UpdateContact(int id) {

            var values = db.tbl_contact.Find(id);
            return View(values);
        }

        [HttpPost]
        public ActionResult UpdateContact(tbl_contact conttactt)
        {
            var value = db.tbl_contact.Find(conttactt.ConcactID);
            value.Description = conttactt.Description;
            value.Adress = conttactt.Adress;
            value.Email = conttactt.Email;
            value.phone  = conttactt.phone;
          

            db.SaveChanges();
            return RedirectToAction("Index");
        }



        public ActionResult CreateContact()
        {
            return View();
        }

        [HttpPost]
        public ActionResult CreateContact(tbl_contact contact)         {
            db.tbl_contact.Add(contact);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

    }
}