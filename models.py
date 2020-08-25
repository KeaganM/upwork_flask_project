from config import db

#todo may want to come back and do this but can just go ahead and query directly like in budapest app

# Example model
# class Example(db.Model):
#
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(100), nullable=False)
#     password = db.Column(db.String(60), nullable=False)
#     admin = db.Column(db.Boolean(),nullable=False,default=0)
#
#     posts = db.relationship("Post", backref="author", lazy=True)
#
#
#     def __repr__(self):
#         return f"User('{self.title}','{self.date_posted}')"


class ChamberList(db.Model):
    index = db.Column(db.Integer,primary_key=True)
    chamber_id = db.Column(db.Integer)
    chamber_name = db.Column(db.String(100))

class CongressList(db.Model):
    index = db.Column(db.Integer,primary_key=True)
    congress_id = db.Column(db.Integer)
    congress_date_start = db.Column(db.Date)
    congress_date_end = db.Column(db.Date)

class CongressList(db.Model):
    index = db.Column(db.Integer, primary_key=True)
    constituency_id = db.Column(db.Integer)
    # congress_flask

if __name__ == "__main__":
    pass
    # reset/empty tables
    # db.drop_all()
    # db.create_all()