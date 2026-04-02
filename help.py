import tkinter.messagebox
from tkinter import*
from tkinter import ttk
from PIL import Image,ImageTk
from tkinter import messagebox
import mysql.connector
import cv2


class Help:
    def __init__(self,root):
        self.root=root
        self.root.geometry("1530x790+0+0")
        self.root.title("face Recognition System")


        title_lbl=Label(self.root,text="HELP DESK",font=("times new roman",35,"bold"),bg="white",fg="black")
        title_lbl.place(x=0,y=0,width=1530,height=45)

        img_top=Image.open(r"C:\Users\happy\Desktop\Face recognition system\college images\har.jpg") # paste the path of image as a bckground of help desk
        img_top=img_top.resize((1530,720),Image.BILINEAR)
        self.photoimg_top=ImageTk.PhotoImage(img_top)

        f_lbl=Label(self.root,image=self.photoimg_top)
        f_lbl.place(x=0,y=55,width=1530,height=720)

        dev_label = Label(f_lbl, text="Email: anshu.raja.cs26@iilm.edu ", font=("times new roman", 20, "bold"),bg="white") # add everyones email id
        dev_label.place(x=550, y=220)
        
        dev_label = Label(f_lbl, text="Email: kumarpriyam.priyadarshi.cs26@iilm.edu ", font=("times new roman", 20, "bold"),bg="white")
        dev_label.place(x=550, y=320)
        
        dev_label = Label(f_lbl, text="Email: shiva.nath.cs26@iilm.edu ", font=("times new roman", 20, "bold"),bg="white")
        dev_label.place(x=550, y=420)



if __name__=="__main__":
    root=Tk()
    obj=Help(root)
    root.mainloop()




