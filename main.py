from tkinter import*
from tkinter import ttk
from PIL import Image,ImageTk
from student import Student
import os
from train import train
from face_recognition import Face_Recognition
from attendence import Attendence
from devloper import developer
from help import Help
import tkinter

class Face_Recognition_System:
     def __init__(self,root):
          self.root=root
          self.root.geometry("1530x790+0+0")
          self.root.title("Face Recognition System")

          # first image 
          img=Image.open(r"C:\Users\happy\Desktop\Face recognition system\college images\1526369384php2Zz81q.png")
          img=img.resize((500,150),Image.BILINEAR)
          self.photoimg=ImageTk.PhotoImage(img)

          f_lbl=Label(self.root,image=self.photoimg)
          f_lbl.place(x=0,y=0,width=500,height=150)

          # second image  
          img1=Image.open(r"C:\Users\happy\Desktop\Face recognition system\college images\facialrecognition (1).png")
          img1=img1.resize((500,150),Image.BILINEAR)
          self.photoimg1=ImageTk.PhotoImage(img1)

          f_lbl=Label(self.root,image=self.photoimg1)
          f_lbl.place(x=500,y=0,width=500,height=150)
        
         # third image 
          img2=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/iilm.webp")
          img2=img2.resize((500,150),Image.BILINEAR)
          self.photoimg2=ImageTk.PhotoImage(img2)

          f_lbl=Label(self.root,image=self.photoimg2)
          f_lbl.place(x=1000,y=0,width=500,height=150)
        
   


          #bg image
          img3=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/bg1.jpg")
          img3=img3.resize((1530,710),Image.BILINEAR)
          self.photoimg3=ImageTk.PhotoImage(img3)

          bg_img=Label(self.root,image=self.photoimg3)
          bg_img.place(x=0,y=130,width=1530,height=710)

          title_lbl=Label(bg_img,text="FACE RECOGNITION ATTENDANCE SYSTEM SOFTWARE ",font =("heinrich",35,"italic"),bg="black",fg="red")
          title_lbl.place(x=0,y=0,width=1530,height=45)

          #student button
          img4=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/student.jpg")
          img4=img4.resize((220,220),Image.BILINEAR)
          self.photoimg4=ImageTk.PhotoImage(img4)

          b1=Button(bg_img,image=self.photoimg4,cursor="hand2",command=self.student_details) 
          
          b1.place(x=200,y=100,width=220,height=220)

          b1_1=Button(bg_img,text="Student details",cursor="hand2",font =("heinrich",15,"italic"),bg="darkred",fg="white", command=self.student_details) 
         
          b1_1.place(x=200,y=300,width=220,height=40)


          #Detect face button
          img5=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/face_detector1.jpg")
          img5=img5.resize((220,220),Image.BILINEAR)
          self.photoimg5=ImageTk.PhotoImage(img5)

          b1=Button(bg_img,image=self.photoimg5,cursor="hand2",command=self.face_data) 
          
          b1.place(x=500,y=100,width=220,height=220)

          b1=Button(bg_img,text="Face Detector",cursor="hand2", font =("heinrich",15,"italic"),bg="darkred",fg="white",command=self.face_data) 
          
          b1.place(x=500,y=300,width=220,height=40)

          #attendence button
          img6=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/Attendence.jpg")
          img6=img6.resize((220,220),Image.BILINEAR)
          self.photoimg6=ImageTk.PhotoImage(img6)

          b1=Button(bg_img,image=self.photoimg6,cursor="hand2", command=self.attendence_data) 
          
          b1.place(x=800,y=100,width=220,height=220)

          b1=Button(bg_img,text="Attendance",cursor="hand2",font =("heinrich",15,"italic"),bg="darkred",fg="white", command=self.attendence_data) 
         
          b1.place(x=800,y=300,width=220,height=40)


           #Help button
          img7=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/help-desk-customer-care-team-icon-blue-square-button-isolated-reflected-abstract-illustration-89657179.jpg")
          img7=img7.resize((220,220),Image.BILINEAR)
          self.photoimg7=ImageTk.PhotoImage(img7)

          b1=Button(bg_img,image=self.photoimg7,cursor="hand2",command=self.help_data) 
          
          b1.place(x=1100,y=100,width=220,height=220)

          b1=Button(bg_img,text="Help Desk",cursor="hand2",font =("heinrich",15,"italic"),bg="darkred",fg="white",command=self.help_data) 
          
          b1.place(x=1100,y=300,width=220,height=40)

           #train button
          img8=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/Train.jpg")
          img8=img8.resize((220,220),Image.BILINEAR)
          self.photoimg8=ImageTk.PhotoImage(img8)

          b1=Button(bg_img,image=self.photoimg8,cursor="hand2",command=self.train_data) 
         
          b1.place(x=200,y=380,width=220,height=220)

          b1=Button(bg_img,text="Train Data",cursor="hand2",command=self.train_data,font =("heinrich",15,"italic"),bg="darkred",fg="white") 
          
          b1.place(x=200,y=580,width=220,height=40)

            #Photos button
          img9=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/group photos.jpg")
          img9=img9.resize((220,220),Image.BILINEAR)
          self.photoimg9=ImageTk.PhotoImage(img9)

          b1=Button(bg_img,image=self.photoimg9,cursor="hand2",command=self.open_img)
          #command=self.Photos_data
          b1.place(x=500,y=380,width=220,height=220)
          

          b1=Button(bg_img,text="Photos",cursor="hand2",command=self.open_img,font =("heinrich",15,"italic"),bg="darkred",fg="white")
          #command=self.Photos_data
          b1.place(x=500,y=580,width=220,height=40)

          #Devloper button
          img10=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/Developerr.jpg")
          img10=img10.resize((220,220),Image.BILINEAR)
          self.photoimg10=ImageTk.PhotoImage(img10)

          b1=Button(bg_img,image=self.photoimg10,cursor="hand2",command=self.developer_data)
          b1.place(x=800,y=380,width=220,height=220)
          
          

          b1=Button(bg_img,text="Developer",cursor="hand2",font =("heinrich",15,"italic"),bg="darkred",fg="white", command=self.developer_data)
          b1.place(x=800,y=580,width=220,height=40)
         
     

           #Exitbutton
          img11=Image.open("C:/Users/happy/Desktop/Face recognition system/college images/exit.jpg")
          img11=img11.resize((220,220),Image.BILINEAR)
          self.photoimg11=ImageTk.PhotoImage(img11)

          b1=Button(bg_img,image=self.photoimg11,cursor="hand2",  command=self.iExit) 
        
          b1.place(x=1100,y=380,width=220,height=220)

          b1=Button(bg_img,text="Exit",cursor="hand2",font =("heinrich",15,"italic"),bg="darkred",fg="white", command=self.iExit) 
          
          b1.place(x=1100,y=580,width=220,height=40)

     def open_img(self):
               os.startfile("data")

          # functions buttons

     def student_details(self):
           self.new_window=Toplevel(self.root)
           self.app=Student(self.new_window)
     def train_data(self):
           self.new_window=Toplevel(self.root)
           self.app=train(self.new_window)

     def face_data(self):
           self.new_window=Toplevel(self.root)
           self.app=Face_Recognition(self.new_window)
     def attendence_data(self):
          self.new_window=Toplevel(self.root)
          self.app=Attendence(self.new_window)
     def help_data(self):
          self.new_window=Toplevel(self.root) 
          self.app=Help(self.new_window)
     
     def developer_data(self):
          self.new_window=Toplevel(self.root)
          self.app=developer(self.new_window)
     
     def iExit(self):
          self.iExit=tkinter.messagebox.askyesno("Face Recognition","Are you sure to exit this page",parent=self.root)
          if self.iExit>0:
               self.root.destroy()
          else:
               return



              


if __name__ == "__main__":
     root=Tk()
     obj=Face_Recognition_System(root)
     root.mainloop()



