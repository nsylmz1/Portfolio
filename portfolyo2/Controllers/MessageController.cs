using portfolyo2.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace portfolyo2.Controllers
{
    public class MessageController : Controller
    {
        // GET: Message

        DbAcunMedyaProjectEntities db = new DbAcunMedyaProjectEntities();

        public ActionResult Index()
        {
            var values = db.tbl_message.ToList();

            return View(values);
        }
        public ActionResult RemoveMessage(int id)
        {
            var values = db.tbl_message.Find(id);
            db.tbl_message.Remove(values);
            db.SaveChanges(); //ctrl s
            return RedirectToAction("Index");
        }
        [HttpGet]
        public ActionResult CreateMessage()
        {
            return View();
        }
        [HttpPost]
        public ActionResult CreateMessage(tbl_message _Message) //Message ıd, Message name 
        {
            db.tbl_message.Add(_Message);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public ActionResult UpdateMessage(int id)
        {
            var values = db.tbl_message.Find(id);
            return View(values);

        }

        [HttpPost]
        public ActionResult UpdateMessage(tbl_message model)
        {
            var value = db.tbl_message.Find(model.MessageID);
            value.NameSurname = model.NameSurname;
            value.Mail = model.Mail;
            value.Subject = model.Subject;
            value.MessageContact = model.MessageContact;

            db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}