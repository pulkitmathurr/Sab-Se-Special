const DashboardController = {

    index: (req, res) => {
        try {
            res.render('panel/index', { title: 'Dashboard' });
        } catch (error) {
            console.log(error);
        }
    }
    
}

module.exports = DashboardController;